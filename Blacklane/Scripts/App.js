var App=(function ($) {
    function getValue($el) {
        return $el.is('[type="checkbox"]') ? $el.prop('checked') :
            $el.is('[type="radio"]') ? !!$('[name="' + $el.attr('name') + '"]:checked').length :
                $el.is('select[multiple]') ? ($el.val() || []).length :
                    $el.val()
    }
    function deferredProxy(result) {
        //is promise
        if (result && result.result && result.result.then) {
            return result.result;
        }
        var deferred = $.Deferred();
        deferred.resolve(result);
        return deferred.promise();
    }
    var app = {

        initForm: function () {
            //Prepare Form

            $(".locationpicker input").placepicker();

            $('input[type=date]').pickadate({
                format: "dddd d  mmmm, yyyy",
                min: true,
                formatSubmit: 'yyyy-mm-dd',
                hiddenPrefix: 'booking_request[',
                hiddenSuffix: ']',
                clear: ''

            }).each(function () {
                var picker = $(this).pickadate('picker');
                picker.set('select', new Date());

            });

            $('input[type=time]').pickatime({
                format: "HH:i (h:i A)",
                interval: 5,
                formatSubmit: 'HH:i',
                hiddenPrefix: 'booking_request[',
                hiddenSuffix: ']',
                //clear: '',
                close: 'close'
            }).each(function () {
                var picker = $(this).pickatime('picker');
                picker.set('select', new Date());
            });

            //cheng request in one-way
            var frm = $('#new_booking_request').validator().on('submit', function (e) {
                if (!$('.has-error').length)//bug:don't current work (!e.originalEvent.defaultPrevented)
                {
                    if ($('#twoWay').hasClass('active'))
                        return;
                    //remove return fields
                    var newfrm = frm.clone().appendTo(document.body);
                    newfrm.find('fieldset.hide input').remove();
                    newfrm.submit();
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            });
        },

        initValidation: function () {

            //form prepare validation
            $.fn.validator.Constructor.INPUT_SELECTOR = '#oneWay input.mustCheck,fieldset.hide.active input.mustCheck'

            $('.frm-transition-header button').on('show.bs.tab', function (e) {
                setTimeout(function () { $('form').validator('update') });
            })


            //Add Custome Validator
            var geocoder = new google.maps.Geocoder();
            $.extend($.fn.validator.Constructor.VALIDATORS, {
                //validate address with google map api
                hasaddressstreetnumber: function ($el) {
                    var deferred = $.Deferred();
                    geocoder.geocode({ address: getValue($el) }, function (results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[0].types[0] === "street_address")
                                deferred.resolve()
                            else
                                deferred.resolve({ key: "hasaddressstreetnumber", result: "Addresses without a street number, or too generic should not be accepted" });
                        } else {
                            deferred.resolve({ key: "hasaddressstreetnumber", result: "http Error:" + status });
                        }
                    });

                    return deferred.promise()
                },
                //validate Date Bigger than
                'datebigger': function ($el) {
                    var target = $el.attr('data-datebigger');
                    var val1 = $el.val();
                    if (val1)
                        val1 = new Date(val1);
                    else
                        return;
                    var val2 = $(target).val();
                    if (val2)
                        val2 = new Date(val2);
                    else
                        return;
                    return val1 < val2 && "'" + $(target)[0].title + "' bigger than '" + $el[0].title + "'";
                }
            });


            //bug:Validator don't support Custom remote validator
            //solution:chenge this part for support that
            $.fn.validator.Constructor.prototype.runValidators = function ($el) {
                var errors = []
                var deferred = $.Deferred();

                $el.data('bs.validator.deferred') && $el.data('bs.validator.deferred').reject()
                $el.data('bs.validator.deferred', deferred)

                function getValidatorSpecificError(key) {
                    return $el.attr('data-' + key + '-error')
                }

                function getValidityStateError() {
                    var validity = $el[0].validity
                    return validity.typeMismatch ? $el.attr('data-type-error')
                        : validity.patternMismatch ? $el.attr('data-pattern-error')
                            : validity.stepMismatch ? $el.attr('data-step-error')
                                : validity.rangeOverflow ? $el.attr('data-max-error')
                                    : validity.rangeUnderflow ? $el.attr('data-min-error')
                                        : validity.valueMissing ? $el.attr('data-required-error')
                                            : null
                }

                function getGenericError() {
                    return $el.attr('data-error')
                }

                function getErrorMessage(key) {
                    return getValidatorSpecificError(key)
                        || getValidityStateError()
                        || getGenericError()
                }
                function handleErrorOnPromise(func) {
                    return function (error) {
                        if (error && error.result) {
                            error = getErrorMessage(error.key) || error.result
                            !~errors.indexOf(error) && errors.push(error);
                        }
                        return func();
                    }
                }
                var promise = deferred.promise();
                deferred.resolve();
                $.each(this.validators, $.proxy(function (key, validator) {
                    var $this = this;
                    promise = promise.then(handleErrorOnPromise(function () {
                        if (!errors.length && (getValue($el) || $el.attr('required')) &&
                            ($el.attr('data-' + key) !== undefined || key == 'native')) {
                            return deferredProxy({ key: key, result: validator.call($this, $el) });
                        }

                        return deferredProxy();

                    }));
                }, this))

                deferred = $.Deferred();
                var $this = this;
                promise.then(handleErrorOnPromise(function () {
                    if (!errors.length && getValue($el) && $el.attr('data-remote')) {
                        $this.defer($el, function () {
                            var data = {}
                            data[$el.attr('name')] = getValue($el)
                            $.get($el.attr('data-remote'), data)
                                .fail(function (jqXHR, textStatus, error) { errors.push(getErrorMessage('remote') || error) })
                                .always(function () { deferred.resolve(errors) })
                        })
                    } else deferred.resolve(errors)
                }));



                return deferred.promise()
            };
        },

    };


    return app;

})(jQuery);

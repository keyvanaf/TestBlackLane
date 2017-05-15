/* ==========================================================================
   App tests
   ========================================================================== */

var $template = '                                                                                                                           \
                                                                                                                                            \
    <form name="booking_request_form" id="new_booking_request" data-toggle="validator" role="form"                                          \
          action="https://www.blacklane.com/en/booking_requests/transfers/new" accept-charset="UTF-8" method="get">                         \
        <input name="utf8" type="hidden" value="✓">                                                                                        \
        <div class="col-sm-6 input locationpicker form-group">                                                                              \
            <input class="mustCheck form-control" type="text" id="pickup" name="booking_request[pickup]"                                    \
                   title="" data-map-container-id="dialogMap1" required data-hasaddressstreetnumber="true">                                 \
            <div class="help-block with-errors"></div>                                                                                      \
        </div>                                                                                                                              \
        <div class="col-sm-6 input locationpicker form-group">                                                                              \
            <input class="mustCheck form-control" type="text" id="dropoff" name="booking_request[dropoff]"                                  \
                   title="" data-map-container-id="dialogMap2" required data-hasaddressstreetnumber="true">                                 \
            <div class="help-block with-errors"></div>                                                                                      \
        </div>                                                                                                                              \
        <div class="col-sm-6 input form-group">                                                                                             \
            <input class="mustCheck datepicker form-control" title="" id="at_date" type="date" name="at_date" required>                     \
            <div class="help-block with-errors"></div>                                                                                      \
        </div>                                                                                                                              \
        <div class="col-sm-6 input form-group">                                                                                             \
            <input class="mustCheck timepicker form-control" type="time" id="at_time" name="at_time" required>                              \
            <div class="help-block with-errors"></div>                                                                                      \
        </div>                                                                                                                              \
        <div class="col-sm-6 input locationpicker form-group">                                                                              \
            <input class="mustCheck form-control" type="text" id="return_pickup" name="booking_request[return_pickup]"                      \
                   title="" data-map-container-id="dialogMap3" required data-hasaddressstreetnumber="true">                                 \
            <div class="help-block with-errors"></div>                                                                                      \
        </div>                                                                                                                              \
        <div class="col-sm-6 input locationpicker form-group">                                                                              \
            <input class="mustCheck form-control" type="text" id="return_dropoff" name="booking_request[return_dropoff]"                    \
                   title="" data-map-container-id="dialogMap4" required data-hasaddressstreetnumber="true">                                 \
            <div class="help-block with-errors"></div>                                                                                      \
        </div>                                                                                                                              \
        <div class="col-sm-6 input form-group">                                                                                             \
            <input class="mustCheck datepicker form-control" title="" type="date" id="return_at_date"                                       \
                   name="return_at_date" required data-datebigger="#at_date">                                                               \
            <div class="help-block with-errors"></div>                                                                                      \
        </div>                                                                                                                              \
        <div class="col-sm-6 input form-group">                                                                                             \
            <input class="mustCheck timepicker form-control" type="time" id="return_at_time" name="return_at_time" required>                \
            <div class="help-block with-errors"></div>                                                                                      \
        </div>                                                                                                                              \
    </form>                                                                                                                                 \
                                                                                                                                            \
                                                                                                                                            \
', $DOM =$('#qunit-fixture');


QUnit.module('AppTest setup', {
    beforeEach: function () {
        $DOM.append($template);
        App.initValidation();
        $.fn.validator.Constructor.INPUT_SELECTOR = 'input.mustCheck';

        App.initForm();
    },
    afterEach: function () {
        $DOM.empty();
    }
});


QUnit.test('Validation & Custom', function (assert) {

    var validators = $.fn.validator.Constructor.VALIDATORS

    assert.ok(!!validators.hasaddressstreetnumber, "'Has address street number' Appent to Validators Collection")
    assert.ok(!!validators.datebigger, "'datebigger' Appent to Validators Collection")

    var validator = $('#new_booking_request').data('bs.validator');
    assert.ok(!!validator, 'validator is Run');
    assert.ok(validator.$inputs.length === 8, 'validator Active For 8 Inputs ')
    var date1 = $('#return_at_date');
    assert.ok(validators.datebigger(date1) === false, 'at_date and Return_at_date are equal togeth3r')
    var date2 = $('#at_date');
    var date = new Date();
    date2.pickadate('picker').set("select", date.setTime(date.getTime() + 3 * 86400000));

    assert.ok(validators.datebigger(date1) != false, 'at_date is bigger than Return_at_date ');
    var $pickup = $('#pickup');
    $pickup.val("Lobeckstraße, 10969 Berlin, Germany");
    var done1 = assert.async();
    validators.hasaddressstreetnumber($pickup).then(function (error) {
        assert.ok(!!error, "'Lobeckstraße, 10969 Berlin, Germany' doesn't have street number");
        done1();
    });
    $pickup.val("Lobeckstraße 64, 10969 Berlin, Germany");
    var done2 = assert.async();
    validators.hasaddressstreetnumber($pickup).then(function (error) {
        assert.ok(!error, "'Lobeckstraße 64, 10969 Berlin, Germany' has street number");
        done2();
    });
});

QUnit.test('Form', function (assert) {

    
    $(".locationpicker input").each(function () {
        assert.ok(!!$(this).data('placepicker'), 'placepicker is active on ' + this.name);
    });

    assert.ok(!!$('#return_at_date').pickadate('picker'), 'pickadate is active on return_at_date');
    assert.ok(!!$('#at_date').pickadate('picker'), 'pickadate is active on at_date');
    assert.ok(!!$('#return_at_time').pickatime('picker'), 'pickatime is active on return_at_time');
    assert.ok(!!$('#at_time').pickatime('picker'), 'pickatime is active on at_time');
});

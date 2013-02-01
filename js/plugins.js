// plugin initialiser

Plugins = {
    init : function() {
        // run all the plugins from here
        this.tabs();
        this.popups();
        this.validator();
    },
    tabs : function() {
        // run the tab
        // tabs for the form fieldsets
        $("#chart-settings").tabs({
            'tabNav': '#formNav ul',
            'tabContent': '#chart-settings',
            'startTab' : 1,
            'fadeIn' : true,
            'fadeSpeed' : 300
        });
    },
    popups : function() {
        // help icon popups
        $(".icon-question-sign").popup({
            'transparentOpacity' : 30,
            'boxHeight' : 500,
            'boxWidth' : 500,
            'titleHeight' : 0,
            'controlHeight' : 0,
            'shadowLength' : 0,
            'onOpen' : function() {
                $("#popupBox .popupClose").addClass("icon-remove-sign");
            }
        });
    },
    validator : function() {

        this.validator.isValid = false;

        // the form validator plugin
        $("#chart-settings").validator({
            inputTypes : {
                // chart type validation
                selectBox: {
                    inputName: 'type-chart',
                    rules: {
                        selectNull: '-- select a chart type --'
                    },
                    error: 'Please select a chart to build'
                },
                // size validation
                sizeHeight : {
                    inputName : 'size-height',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                },
                sizeWidth : {
                    inputName : 'size-width',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                },
                sizeOuter : {
                    inputName : 'size-outer-radius',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                },
                sizeInner : {
                    inputName : 'size-inner-radius',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                },
                sizePadding : {
                    inputName : 'size-padding',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                },
                // theme validation
                headerName : {
                    inputName : 'theme-header-name',
                    rules : {min:1},
                    error : 'please enter some text'
                },
                headerSize : {
                    inputName : 'theme-header-size',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                },
                headerOffsetLeft : {
                    inputName : 'theme-header-offsetX',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                },
                headerOffsetTop : {
                    inputName : 'theme-header-offsetY',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                },
                labelSize : {
                    inputName : 'theme-label-size',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                },
                labelPosition : {
                    inputName : 'theme-label-position',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                },
                borderSize : {
                    inputName : 'theme-data-border-size',
                    rules : {isNumber: true},
                    error : 'please enter a number'
                }
            },
            onChangeValidation : true,
            // I need to hook up a submit event that will fire the form submit
            submitFunction : function() {
                console.log("form has validated");
                ChartBuilder.buildChart();
                // set the isValid flag to true
                Plugins.validator.isValid = true;
            },
            errorFunction : function() {
                // if there is an error on the form, then show the first fieldset that has an error in it
                var errorFields = $("#chart-settings .fieldActiveInvalid"),
                    fieldsetError,
                    fieldsetIndex;
                
                if (errorFields.length > 0) {
                    fieldsetError = $(errorFields[0]).closest("fieldset");
                    fieldsetIndex = fieldsetError.parent().children("fieldset").index(fieldsetError);
                    //console.log(fieldsetIndex);
                    $("#chart-settings").tabs('showTab', fieldsetIndex);
                }

                // set the valid flag to false
                Plugins.validator.isValid = false;

            }
        });

        // manage the fields that are optional
        // start with the theme
        $(".show-section").on('change', function() {
            var section = $(this).attr("id"),
                sectionInputs = $(this).closest("fieldset").find("li." + section + " input");
            if ($(this).attr("checked")) {
                // add validation to those fields
                sectionInputs.addClass("required");
            }
            else {
                // remove validation from those fields
                sectionInputs.removeClass("required");
            }
            $("#chart-settings").validator('getValidationFields');
        });
    }
}
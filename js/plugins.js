var D3Builder = D3Builder || {};
// plugin initialiser
D3Builder.plugins = (function($, undefined) {
    'use strict';

    var plugins = {
        init : function() {
            // run all the plugins from here
            this.tabs();
            this.popups();
            this.colorPicker();
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
                'transparentOpacity' : 50,
                'boxHeight' : 400,
                'boxWidth' : 500,
                'titleHeight' : 0,
                'controlHeight' : 0,
                'shadowLength' : 0,
                'onOpen' : function() {
                    $("#popupBox .popupClose").addClass("icon-remove-sign");
                }
            });
        },
        colorPicker : function() {
            var themeColorInputs = $("#theme-background-color, #theme-header-color, #theme-label-color, #theme-data-border-color, fieldset.color .palette li.color input"),
                activeInput,  // this is the input that is being changed
                activePicker;  // the active picker window box

            // math helper function from the jPicker plugin
            Math.precision = function(value, precision) {
                if (precision === undefined) {
                    precision = 0;
                }
                return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
            };

            function setActiveColor(color) {
                var bgColor = "#" + color.val("hex"),
                    textColor = "#ffffff",
                    colorAlpha = Math.precision((color.val("a") / 255) * 100),
                    alphaBox,
                    //activePicker = activePicker,
                    bgBox = activePicker.find(".Color");

                // make sure there is an active picker before finding the alpha color
                if (activePicker) {
                    alphaBox = activePicker.find(".Alpha");
                }

                if (color.val("v") > 75) {
                    textColor = "#000000";
                }
                // set the color of the active input
                activeInput.css({
                    "background-color" : bgColor,
                    "color" : textColor
                });
                // set the css for the picker window
                if (colorAlpha < 100 && alphaBox) {
                    alphaBox.css({
                        "visibility" : "visible",
                        "opacity" : colorAlpha / 100
                    });
                }
                else if (alphaBox) {
                    alphaBox.css({
                        "visibility" : "hidden",
                        "opacity" : 1
                    });
                }
                if (bgBox) {
                    bgBox.css("background-color", bgColor); 
                }
            }

            // adds the picker boxes to each of the inputs
            themeColorInputs.after('<span class="jPicker"><span class="Icon"><span class="Color">&nbsp;</span><span class="Alpha" style="background-image: url(&quot;css/img/bar-opacity.png&quot;); visibility: hidden;">&nbsp;</span><span title="Click To Open Color Picker" class="Image" style="background-image: url(&quot;css/img/picker.gif&quot;);">&nbsp;</span><span class="Container">&nbsp;</span></span></span>');
            // should I setActiveColor for each of these items now? probably
            themeColorInputs.each(function() {
                var color = "#" + $(this).attr("value");
                $(this).css("background-color", color).next().find(".Color").css("background-color", color);
            });

            // add the color picker and then bind the input fields to it.
            $("#color-value").jPicker({
                window : {
                    expandable : true,
                    title : 'Theme Colour',
                    position : {
                        x : 'screenCenter',
                        y : 200
                    },
                    alphaSupport : true
                },
                images : {
                    clientPath: 'css/img/'
                },
                color : {
                    alphaSupport : true
                }
            },
            // commit callback
            function(color, context) {
                setActiveColor(color);
                activeInput.attr("value", color.val("hex"));
            },
            // live callback
            function(color, context) {  
                setActiveColor(color);
            },
            // cancel callback
            function() {
            });

            themeColorInputs.on("keydown", function() {
                // when these inputs are changed then send it to the colour picker to get the value and then set background and color
                // set the active field
                activeInput = $(this);
                activePicker = activeInput.next();
                $("#color-value").attr("value", activeInput.attr("value")).trigger("keyup");
            });
            themeColorInputs.on("change", function() {
                // when these inputs are changed then send it to the colour picker to get the value and then set background and color
                // set the active field
                activeInput = $(this);
                activePicker = activeInput.next();
                $("#color-value").attr("value", activeInput.attr("value")).trigger("keyup");
            });
            themeColorInputs.on("focus", function() {
                activeInput = $(this);
                activePicker = activeInput.siblings(".jPicker");
            });
            themeColorInputs.next().on("click", function() {
                activeInput = $(this).prev();
                activePicker = $(this);
                $("#color-value").attr("value", activeInput.attr("value")).trigger("keyup");
                $.jPicker.List[0].show();
            });  
        },
        validator : function() {
            var plguins = this;

            plugins.validator.isValid = false;

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
                    },
                    dataSpacing : {
                        inputName : 'theme-data-spacing',
                        rules : {isNumber: true},
                        error : 'please enter a number'
                    }
                },
                onChangeValidation : true,
                // I need to hook up a submit event that will fire the form submit
                submitFunction : function() {
                    console.log("form has validated");
                    D3Builder.chartBuilder.buildChart();
                    // set the isValid flag to true
                    plugins.validator.isValid = true;
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
                    plugins.validator.isValid = false;

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
    };

    $(document).ready(function() {
        plugins.init();
    });

    return plugins;
})(jQuery);
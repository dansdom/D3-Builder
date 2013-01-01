/*
	jQuery Form Validator Plugin v2.0
	Copyright (c) 2011 Daniel Thomson
	https://github.com/dansdom/plugins-form-validator
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/
// version 1.1	- added full date functionality
//				- added custom 'valid' message
// version 1.2	- changed fieldType declaration to the name attribute rather than the class name
//				- made custom error messages optional rather than necessary, now if there is no custom message then it will display the validation type error
//				- added reset event that replaces .error with &#42; and resets class behaviour
// version 1.3	- added maxValue and minValue rules for testing integer sizes
//				- added custom rule function that will let the developer add their own validation routines. more than one should be allowed
//				- added isUsername to check for valid twitter username for my project
// version 1.4	- added support for custom validation functions
//				- added option to validate on key change or only on field blur
//				- added field valid message class
//				- added optional field class that will validate
// version 2.0	- reconfigured the plugin to use mine new architecture: https://github.com/dansdom/plugins-template-v2
//
// Notes:
// checkboxes and radio button groups will share the same name attribute to identify the group
//		  Avaliable Rules:
//		  min			  	- value: numeric;	 minimum length of input
//		  max			  	- value: numeric;	 maximum langth of input
//		  minValue		  	- value: numeric;	 minimum numeric value of a field
//		  maxValue		  	- value: numeric;	 maximum numeric value of a field		
//		  checkboxMin		- value: numeric;	 minimum number of checkboxes that can be selected
//		  checkboxMax		- value: numeric;	 maximum number of checkboxes that can be selected - "true" = all
//		  fileType		  	- value: string;	 file types allowed for file inputs, this is a list of extensions seperated by a comma
//		  isNumber		  	- value: boolean;	 only numbers allowed as an input value
//		  lettersOnly		- value: boolean;	 only letters allowed as an input value
//		  passConfirm		- value: boolean;	 the field that it is checking the value against
//		  validURL		  	- value: boolean;	 validates a url input - set to "true". default is false
//		  validEmail	  	- value: boolean;	 checks that the value is a valid emial address
//		  date			  	- value: boolean;	 checks that the value is in a valid date format, supporting some of datepickers format types.
//		  dateFuture	  	- value: boolean;	 checks that the value is a date in the future
//		  datePast		  	- value: boolean;	 checks that the date is in the past
//		  checkHtmlTags	  	- value: string;	 list of tags seperated by commas. eg. "<div>,<p>,<span>" - if empty, checks for all tags. Checks for HTML tags in the input data
//		  selectNull	  	- value: string;	 default value of the select box - used to check against. Data object only, will return error if this is the value
//		  selectHasValue  	- value: boolean;	 checks whether the default value of the select box is not selected - will test against a true value
//		  radioReq		  	- value: boolean;	 true: a radio btn has to be selected. This will only validate on form submit
//		  noSpaces		  	- value: boolean;	 true: no spaces are allowed in the input
//		  custom			- value: boolean;  true: checks the custom validation function
//		  onChangeValidation - value: boolean; true: option to validate on input change, if false then validation occurs on the blur event
//		  Date format type allowed:
//		  numeric values: D,M,Y
//		  seperators: , / - &nbps;
//		  Month values: short and long, word or number
//		  Day values: short and long
//		  Valid year range: 1000 - 3000
// Notes on Functionality
// 1. Associated error message will carry the same title and have the errorClass name
// 2. plugin will only validate the fields that have the requiredClass name
// Default input types are just a guide. It is recommended that the user define his own custom field. Do this thus:
// 1. define the input type name eg. myField
// 2. define the name of the input in the HTML eg. inputName: 'myFieldName'
// 3. define the rules to apply to that field eg. rules:{min:2,max:10,validURL:true}
// 4. define a custom error message (optional) eg. message: 'This field has particular needs'
// 5. putting it together on a <form id="pageForm"> :
//
//	$(document).ready(function(){
//		$("#pageForm").validator({
//				inputTypes:{
//					 myField: {
//								inputName: 'myFieldName',
//								rules: {min:2,max:10,validURL:true},
//								message: 'This field has particular needs'}}
//							  });

(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
	
	// Plugin namespace definition
	$.Validator = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "validator";
		
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.opts = $.extend(true, {}, $.Validator.settings, options);
		
		// define the required, optional and validations fields
		this.theFormRequired = this.el.find("." + this.opts.formClasses.requiredClass),
		this.theFormOptional = this.el.find("." + this.opts.formClasses.optionalClass),
		this.theFormValidationFields = this.el.find("." + this.opts.formClasses.requiredClass + ", ." + this.opts.formClasses.optionalClass);
			
		this.init();
		
		// run the callback function if it is defined
		if (typeof callback === "function")
		{
			callback.call();
		}
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.Validator.settings = {
		inputTypes: {
			textField: {
				inputName: 'firstName',
				// this is the name attribute of the HTML form element
				rules: {
					min: 2,
					max: 20,
					lettersOnly: true,
					noSpaces: true
				}
			},
			textMessage: {
				inputName: 'message',
				rules: {
					min: 5,
					max: 100,
					validHTMLTags: '<div>,<p>,<span>,<b>'
				}
			},
			urlField: {
				inputName: 'url',
				rules: {
					validURL: true
				}
			},
			selectBox: {
				inputName: 'selectbox',
				rules: {
					selectHasValue: true,
					selectNull: '-please select-'
				},
				error: 'Please select a value for this field',
				valid: 'the field is valid - woot!'
			},
			radioBtn: {
				inputName: 'radio1',
				rules: {
					radioReq: true
				}
			},
			fileData: {
				inputName: 'fileData',
				rules: {
					fileType: 'doc,txt,html'
				}
			},
			checkboxField: {
				inputName: 'checkboxField',
				rules: {
					checkboxMin: 1
				}
			},
			date: {
				inputName: 'dateField',
				rules: {
					date: true
				}
			}
		},
		formClasses: {
			// have something to do validation when navigating to different fieldsets?!?
			// could do a $(".myfieldset").find("."+opts.formClasses.requiredClass).each(function(){$.fn.validator.validateField($(this),opts)}) on a click event or something;
			// fieldsetClass: 'formField',
			submitClass: 'submitField',
			resetClass: 'reset',
			requiredClass: 'required',
			optionalClass: 'optional',
			errorClass: 'error',
			errorMessage: 'The field has an error!',
			validClass: 'valid',
			validMessage: 'The field should be valid!',
			fieldActive: 'fieldActive',
			fieldActiveValid: 'fieldActiveValid',
			fieldActiveInvalid: 'fieldActiveInvalid'
		},
		longMonths: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
		shortMonths: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
		longDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
		shortDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
		errorCount: 0,
		onChangeValidation: true
	};
	
	// plugin functions go here
	$.Validator.prototype = {
		init : function() {
			
			// this seems a bit hacky, but for now I will unbind the namespace first before binding
			this.destroy();
			
			// going to need to define this, as there are some anonymous closures in this function.
			// something interesting to consider
			var validator = this;
			
			// ************************
			// start event handling for each of the required fields in the form
			this.theFormValidationFields.each(function ()
			{

				$(this).bind('focus.' + validator.namespace, function ()
				{
					$(this).addClass(validator.opts.formClasses.fieldActive);
				});

				$(this).bind('blur.' + validator.namespace, function ()
				{
					$(this).removeClass(validator.opts.formClasses.fieldActive);
					$(this).removeClass(validator.opts.formClasses.fieldActiveValid);
					$(this).removeClass(validator.opts.formClasses.fieldActiveInvalid);
					// if this field has a value then validate it
					if ($(this).attr("value") !== "")
					{
						validator.validateField($(this));
					}
				});

				$(this).bind('change.' + validator.namespace, function ()
				{
					// if this is a required field then validate it											
					validator.validateField($(this));
				});

				$(this).bind('keyup.' + validator.namespace, function ()
				{
					// if this field has a value and the option to validate 'on the fly' is true then validate it
					if ($(this).attr("value") !== "" && validator.opts.onChangeValidation == true)
					{
						validator.validateField($(this));
					}
				});

				// basically the event 'change' doesn't work on select and radio boxes in IE6 - so I have to add a 'click'
				// event handler to those elements so that IE will play nice - dang!
				if (($(this).attr("type") == "checkbox" || $(this).attr("type") == "radio"))
				{
					$(this).bind('click.' + validator.namespace, function ()
					{
						validator.validateField($(this));
					});
				}
			});

			// do validation when the form has been submitted
			this.el.bind('submit.' + this.namespace, function ()
			{

				validator.opts.errorCount = 0;

				validator.theFormRequired.each(function ()
				{
					//validate each of the required fields and then send off to the back end :)		
					//console.log("validating field: "+theFormRequired.attr("id"));							 
					validator.validateField($(this));
				});

				// check the error count									  
				if (validator.opts.errorCount === 0)
				{
					// if no errors then return the page true
					return true;
				}
				else
				{
					//alert("you still have errors in the form");
					validator.el.find("." + validator.opts.formClasses.fieldActiveValid).removeClass(validator.opts.formClasses.fieldActiveValid);
					return false;
				}
			});

			this.el.find("." + this.opts.formClasses.resetClass).bind('click.' + this.namespace, function ()
			{
				// remove error class from the form, and maybe reset all values?
				// not sure I need to remove the last two classes here
				this.form.find("." + this.opts.formClasses.errorClass).removeClass(this.opts.formClasses.validClass).removeClass(this.opts.formClasses.fieldActiveValid).removeClass(this.opts.formClasses.fieldActiveInvalid);
				this.form.find("." + this.opts.formClasses.errorClass).html("&#42;");
			});
			// ************************
			
		},
		// I might look to break up this function - its a bit long and hairy atm
		// Validate the current field
		validateField : function (field)
		{
			var hasError = false,
				fieldName = field.attr("name"),
				fieldValue = field.attr("value"),
				fieldType, fieldRules, fieldErrorMessage, fieldValidMessage, errorMessage, message, checkedInField, dateArray, i;
	
			// if a select box then look for the option:selected value
			if (field.children("option").length > 0)
			{
				fieldValue = field.children("option:selected").text();
			}
	
			// check whether its an empty field or not
			if (fieldValue === "")
			{
				hasError = true;
			}
	
			// check which input type this field has
			for (i in this.opts.inputTypes)
			{
				// loop through the list of classes on the object and see if any match a class on the inputTypes object
				if (fieldName == this.opts.inputTypes[i].inputName)
				{
					fieldType = i;
					fieldRules = this.opts.inputTypes[i].rules;
					fieldErrorMessage = this.opts.inputTypes[i].error;
					fieldValidMessage = this.opts.inputTypes[i].valid;
				}
			}
	
			// add new rulesets to this switch function
			// check whether the rule is defined. If so, then do the validation routine on it.
			if (fieldValue)
			{
				fieldValue = this.stripWhiteSpace(fieldValue);
			}
	
			for (i in fieldRules)
			{
				// check if field is empty and min is not 0, if so throw an error
				if (fieldRules.hasOwnProperty(i))
				{
					switch (i)
					{
					case "min":
						// check min length
						if (fieldValue.length < fieldRules[i])
						{
							hasError = true;
							errorMessage = "Must be at least " + fieldRules[i] + " characters";
						}
						break;
					case "max":
						// check max length
						if (fieldValue.length > fieldRules[i])
						{
							hasError = true;
							errorMessage = "Must be less than " + fieldRules[i] + " characters";
						}
						break;
					case "minValue":
						if (parseFloat(fieldValue) < fieldRules[i])
						{
							hasError = true;
							errorMessage = "the value is lower than the minimum value";
						}
						break;
					case "maxValue":
						if (parseFloat(fieldValue) > fieldRules[i])
						{
							hasError = true;
							errorMessage = "the value is higher than the maximum allowed";
						}
						break;
					case "checkboxMin":
						// check how many checkboxes checked
						// get a list of checkboxes in the group - have the same name
						checkedInField = $("input[name=" + fieldName + "]:checked");
						if (checkedInField.length < fieldRules[i])
						{
							hasError = true;
							errorMessage = "More options need to be selected";
						}
						break;
					case "checkboxMax":
						// check how many checkboxes checked
						checkedInField = $("input[name=" + fieldName + "]:checked");
						if (checkedInField.length > fieldRules[i])
						{
							hasError = true;
							errorMessage = "More than the maximum allowable have been selected";
						}
						break;
					case "radioReq":
						// check that at least one field is selected in the radio list
						checkedInField = $("input[name=" + fieldName + "]:checked");
						if (checkedInField.length > 1)
						{
							//console.warn("more than one radio fields selected");
							hasError = true;
							errorMessage = "More than radio field has been selected";
						}
						break;
					case "selectNull":
						// check whether the current value is the same as the 'null' value
						if (fieldValue == fieldRules[i])
						{
							hasError = true;
							errorMessage = "Please select a value";
						}
						break;
					case "fileType":
						// check file extension
						if (!this.isFileValid(fieldValue, fieldRules[i]))
						{
							hasError = true;
							errorMessage = "The wrong type of file has been selected";
						}
						break;
					case "isNumber":
						// check that value is a number
						if (fieldRules[i] && !this.isNumber(fieldValue))
						{
							hasError = true;
							errorMessage = "The value is not a number";
						}
						break;
					case "lettersOnly":
						// check that value is a word
						// could probably combine the logic of these two if statements
						if (fieldRules[i] && !this.isText(fieldValue))
						{
							hasError = true;
							errorMessage = "The input can only be text";
						}
						break;
					case "validPassword":
						// check that the password is valid
						if (fieldRules[i] && !this.isValidPassword(fieldValue))
						{
							hasError = true;
							errorMessage = "The password has illegal characters";
						}
						break;
					case "passConfirm":
						// check the value of the pass confirmation
						var thisTitle = field.attr("title"),
							passField = $("input[type='password'][title=" + thisTitle + "][name!=" + fieldName + "]"),
							passValue = passField.attr("value");
							
						if (fieldValue != passValue)
						{
							hasError = true;
							errorMessage = "The password does not match";
						}
						break;
					case "validURL":
						// check whether the value is valid url
						if (fieldRules[i] && !this.isValidURL(fieldValue))
						{
							hasError = true;
							errorMessage = "That is not a valid URL";
						}
						break;
					case "validEmail":
						// check whether the value is a valid email
						//console.log("rules: "+fieldRules[i]+", field value: "+fieldValue);
						//break;
						if (fieldRules[i] && !this.isValidEmail(fieldValue))
						{
							hasError = true;
							errorMessage = "That is not a valid email address";
						}
						break;
					case "date":
						// check whether the value is a valid date
						if (fieldRules[i] === true)
						{
							// get the input value as an array and then pass it to isDateValid to test if it is valid. Need to test that $.fn.validator.getDateArray is not false before running isDateValid
							dateArray = this.getDateArray(fieldValue);
							if (!dateArray || !this.isValidDate(dateArray))
							{
								hasError = true;
								errorMessage = "The date format is not valid";
							}
						}
						break;
					case "dateFuture":
						if (fieldRules[i] === true)
						{
							//alert("finding rule");
							// check logic of this and 'past' test. Need to test that $.fn.validator.getDateArray is not false before running dateTense
							dateArray = this.getDateArray(fieldValue);
							if (!dateArray || this.dateTense(dateArray) != 'future')
							{
								hasError = true;
								errorMessage = "The date needs to be in the future";
							}
						}
						break;
					case "datePast":
						if (fieldRules[i] === true)
						{
							// need to test that $.fn.validator.getDateArray is not false before running dateTense
							dateArray = this.getDateArray(fieldValue);
							if (!dateArray || this.dateTense(dateArray) != 'past')
							{
								hasError = true;
								errorMessage = "The date needs to be in the past";
							}
						}
						break;
					case "checkHTMLTags":
						// check that there are no HTML tags in the input - won't be using this function now
						if (fieldRules[i] === true)
						{
							if (this.findHTML(fieldValue))
							{
								hasError = true;
								errorMessage = "The input contains HTML tags";
							}
						}
						break;
					case "validHTMLTags":
						// check that there are no HTML tags in the input, and also filter out the valid ones
						if (fieldRules[i] && this.findHTMLTags(fieldValue, fieldRules[i]))
						{
							hasError = true;
							errorMessage = "The input contains non-valid HTML tags";
						}
						break;
					case "noSpaces":
						// check that there are no spaces in between character input
						if (fieldRules[i] && fieldValue.split(" ").length > 1)
						{
							hasError = true;
							errorMessage = "There are spaces in the input";
						}
						break;											
					default:
						// do nothing here
					}
	
					if (hasError === true)
					{
						// if no custom message then add the generic one
						if (!fieldErrorMessage)
						{
							message = errorMessage;																				
						}
						else
						{	
							message = fieldErrorMessage;																	
						}
						$("." + this.opts.formClasses.errorClass + "[title='" + fieldName + "']").html(message);					
						field.removeClass("fieldActiveValid").addClass("fieldActiveInvalid");
						this.opts.errorCount++;
					}
					else
					{
						// if no custom valid message, then add the generic one
						if (!fieldValidMessage)
						{
							message = this.opts.formClasses.validMessage;						
						}
						else
						{
							message = fieldValidMessage;
						}
						$("." + this.opts.formClasses.errorClass + "[title='" + fieldName + "']").html('<span class="' + this.opts.formClasses.validClass + '">' + message + '</span>');
						field.removeClass("fieldActiveInvalid").addClass("fieldActiveValid");					
					}
				}
			}
		},
		////////////////////////////
		//  VALIDATION FUNCTIONS  //
		////////////////////////////
		
		// file validation function
		isFileValid : function (file, ext)
		{
			var theRule = ext.split(","),
				filePath = file.split("/"),
				filePathLength = filePath.length,
				fileName = filePath[filePathLength - 1],
				fileType = fileName.split("."),
				fileTypeLength = fileType.length,
				fileExt = fileType[fileTypeLength - 1],
				i;
			// validate fileExt against the validation rule now.
			for (i = 0; i < theRule.length; i++)
			{
				if (fileExt == theRule[i])
				{
					return true;
				}
			}
			return false;
		},
		// Check for Valid URL: - url regex is not so good
		isValidURL : function (url)
		{
			var regex = /^(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][\-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?(\/([\-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&?([\-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([\-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?$/;
			return regex.test(url);
			/*
			if (regex.test(url))
			{
				return true;
			}
			else
			{
				return false;
			}
			*/
		},
		// Check for Valid Email Address: - this regex seems to be working, will need to do some proper testing on it though. Obviously you can't cover everything with this
		isValidEmail : function (email)
		{
			var regex = /^((([a-z]|[0-9]|!|#|$|%|&|'|\*|\+|\-|\/|=|\?|\^|_|`|\{|\||\}|~)+(\.([a-z]|[0-9]|!|#|$|%|&|'|\*|\+|\-|\/|=|\?|\^|_|`|\{|\||\}|~)+)*)@((((([a-z]|[0-9])([a-z]|[0-9]|\-){0,61}([a-z]|[0-9])\.))*([a-z]|[0-9])([a-z]|[0-9]|\-){0,61}([a-z]|[0-9])\.)[\w]{2,4}|(((([0-9]){1,3}\.){3}([0-9]){1,3}))|(\[((([0-9]){1,3}\.){3}([0-9]){1,3})\])))$/;
			return regex.test(email);
			/*
			if (regex.test(email))
			{
				return true;
			}
			else
			{
				return false;
			}
			*/
		},
		// Strip white spaces around a string
		stripWhiteSpace : function (string)
		{
			// just a straight regex replace to delete whitespace before and after the string
			//var cleanString = string.replace(/^\s+|\s+$/g, '');
			//return cleanString;
			return string.replace(/^\s+|\s+$/g, '');
		},
		// Detects whether there is white space in the string
		hasWhiteSpace : function (string)
		{
			var regex = /[\s+]/; // space
			// going to just do a search for spaces
			return regex.test(string);
			/*
			if (regex.test(string))
			{
				return true;
			}
			else
			{
				return false;
			}
			*/
		},
		// Check input in Text Field:
		haveValue : function (text)
		{
			// clear whitespaces before and after text value
			var inputText = text.replace(/^\s+|\s+$/g, '');
			if (inputText !== '')
			{
				return true;
			}
			else
			{
				return false;
			}
		},
		isText : function (string)
		{
			var regex = /[^a-zA-Z\s]/; // not a word, space
			// going to just do a search for non text chars - this regex is bogus, I think?
			return !regex.test(string);
			/*
			if (!regex.test(string))
			{
				return true;
			}
			else
			{
				return false;
			}
			*/
		},
		// letters, numbers and underscore - also need less than 15 chars, but will put that elsewhere
		isUsername : function (string)
		{
			var regex = /[^a-zA-Z0-9\_\s]/; // not a word, space
			// going to just do a search for non text chars - this regex is bogus, I think?
			return !regex.test(string);
			/*
			if (!regex.test(string))
			{
				return true;
			}
			else
			{
				return false;
			}
			*/
		},
		// checks for a real number
		isNumber : function (inputValue)
		{
			//var regex = /(a plus or minus sign)(a number)(a decimal point)(another number) or (a plus or minus sign)(a decimal point)(another number) /;
			var regex = /^([\-\+]?[0-9]+[\.]?[0-9]+|[\-\+]?[\.]?[0-9]+){1}$/;
			return regex.test(inputValue);
			/*
			if (regex.test(inputValue))
			{
				return true;
			}
			else
			{
				return false;
			}
			*/
		},
		// check a maximum of decimal places
		isMoney : function (inputValue)
		{
			var decimalSplit = false;
			if (inputValue.split(".") != undefined)
			{
				decimalSplit = inputValue.split(".");
			}
			if (decimalSplit && decimalSplit.length == 2)
			{
				if (decimalSplit[1].length < 3)
				{
					return true;
				}
				else
				{
					return false;
				}
			}
			else
			{
				return true;
			}
			return true;
		},
		// test for Valid Password: any letter or number, underscore, or any of - !@#$%^&*()-+
		isValidPassword : function (password)
		{
			var regex = /^[a-zA-Z0-9!\@#\$%\^&\*\(\)\-\+=\.\?]+$/;
			return regex.test(password);
			/*
			if (regex.test(password))
			{
				return true;
			}
			else
			{
				return false;
			}
			*/
		},
		// checks the list of allowable HTML tags, strips them out, and then tests for other html tags in the input data
		findHTMLTags : function (fieldValue, validTags)
		{
			var inputData = fieldValue,
				tagsArray = validTags.split(","),
				regex = /<\/?[a-zA-Z]+\s?([a-zA-Z]+=["'][^>"']+["']|[^>"']+)*>/,
				tagsRegex = "",
				tag;
				
			for (var i in tagsArray)
			{
				if (tagsArray.hasOwnProperty(i))
				{
					// add tags to the regex, then parse
					// I have to strip the brakets out of the [i] value before putting in the string and then turn it into a regex, and then replace out those tags
					tag = tagsArray[i].replace(/[<>]/g, "");
					tagsRegex = "<\/?" + tag + "\\s?([a-zA-Z]+=[\"\'][^>\"\']+[\"\']|[^>\"\']+)*>";
					tagsRegex = new RegExp(tagsRegex, "gi");
					inputData = inputData.replace(tagsRegex, "");
				}
			}
			// now that the 'allowed' tags have been stripped out of the html, do a re-test of the field value to see if it still contains html
			return regex.test(inputData);
			/*
			if (regex.test(inputData))
			{
				return true;
			}
			else
			{
				return false;
			}
			*/
		},
		getDateArray : function (inputValue)
		{
	
			// split the date input into its component parts. 3 seperators - " " or "-" or "/"
			// clean up commas and white spaces
			// if array is contains days of the week, then give it the chop
			var dateArray, isDay, dayIndex, i, j;
			inputValue = inputValue.replace(",", "");
			inputValue = inputValue.replace(/[\s]+?/g, " ");
			dateArray = inputValue.split(/[\s\-\/]/);
	
			// I need to now splice out the empty array elements
			for (i = 0; i < dateArray.length; i++)
			{
				if (dateArray[i] === '')
				{
					dateArray.splice(i, 1);
					i--;
				}
			}
	
			// if dataArray is length 4 then look for either a full day of short day text and splice it out
			for (i in this.opts.longDays)
			{
				if (this.opts.longDays.hasOwnProperty(i))
				{
					for (j in dateArray)
					{
						if (dateArray.hasOwnProperty(j))
						{
							if (dateArray[j] == this.opts.longDays[i])
							{
								isDay = true;
								dayIndex = j;
							}
						}
					}
				}
			}
			for (i in this.opts.shortDays)
			{
				if (this.opts.shortDays.hasOwnProperty(i))
				{
					for (j in dateArray)
					{
						if (dateArray.hasOwnProperty(j))
						{
							if (dateArray[j] == this.opts.shortDays[i])
							{
								isDay = true;
								dayIndex = j;
							}
						}
					}
				}
			}
	
			// want to clean up any 'st', 'nd' and 'rd' and 'th' in each element in the date array
			for (i in dateArray)
			{
				if (dateArray[i])
				{
					dateArray[i] = dateArray[i].replace(/(st)|(nd)|(rd)|(th)/gi, "");
				}
			}
	
			// if there are any day strings then chop 'em out
			if (dateArray.length === 4 && isDay === true)
			{
				dateArray.splice(dayIndex, 1);
			}
	
			// then test if it is 3 long - if so return it
			if (dateArray.length == 3)
			{
				return dateArray;
			}
			// if other than 3 long return false, date not valid
			return false;
	
		},
		// Date validation function
		isValidDate : function (dateArray)
		{
			var isMonth = false,
				isYear = false,
				isDay = false,
				i,
				// check the months value first
				regex = /^[0-9]{1,2}$/,
				month, year, days = 31;
			// for numeric value
			if (regex.test(dateArray[1]) && (dateArray[1] > 0 && dateArray[1] < 13))
			{
				// first valus is a date
				month = parseInt(dateArray[1], 10);
				isMonth = true;
			}
			// for text value
			else
			{
				//for (i in longMonths)
				for (i in this.opts.longMonths)
				{
					if (dateArray[1].toLowerCase() == this.opts.longMonths[i])
					{
						month = parseInt(i, 10) + 1;
						isMonth = true;
					}
				}
				//for (i in shortMonths)
				for (i in this.opts.shortMonths)
				{
					if (dateArray[1].toLowerCase() == this.opts.shortMonths[i])
					{
						month = parseInt(i, 10) + 1;
						isMonth = true;
					}
				}
			}
	
			// check the years value for a valid numeric value. the range is between 1000 and 3000
			regex = /^([0-9]{2}|[0-9]{4})$/;
			// if ( (its a number) and (its between 0 and 99 or between 1000 and 3000) )
			if (regex.test(dateArray[2]) && (((dateArray[2] >= 0) && (dateArray[2] < 100)) || ((dateArray[2] > 1000) && dateArray[2] < 3000)))
			{
				// first valus is a date
				year = dateArray[2];
				isYear = true;
			}
	
			// check the second item in the array for either a numeric value or text value
			// check the number of days that the month has
			if (month == 4 || month == 6 || month == 9 || month == 11)
			{
				days = 30;
			}
			else if (month === 2)
			{
				if ((year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0)))
				{
					days = 29;
				}
				else
				{
					days = 28;
				}
			}
	
			// test whether input value is in the date range
			if (dateArray[0] > 0 && dateArray[0] <= days)
			{
				isDay = true;
			}
	
			// if all the values are true then return true
			if (isDay === true && isMonth === true && isYear === true)
			{
				return true;
			}
			else
			{
				return false;
			}
	
		},
		// this function will return true if the date is in the future, and false if the date is in the past
		dateTense : function (dateArray)
		{
			var dateArrayI, inputDate, currentTime, i;
			// if the month is a word, then convert it to a number. search longMonths and shortMonths arrays for a match and then convert to that index
			for (i in this.opts.longMonths)
			{
				if (this.opts.longMonths.hasOwnProperty(i))
				{
					// convert to string and then to lower case
					dateArrayI = (dateArray[1] + "").toLowerCase();
					if (dateArrayI == this.opts.longMonths[i])
					{
						dateArray[1] = parseInt(i, 10) + 1;
					}
				}
			}
			for (i in this.opts.shortMonths)
			{
				if (this.opts.shortMonths.hasOwnProperty(i))
				{
					// convert to string and then to lower case
					dateArrayI = (dateArray[1] + "").toLowerCase();
					if (dateArrayI == this.opts.shortMonths[i])
					{
						dateArray[1] = parseInt(i, 10) + 1;
					}
				}
			}
			dateArray[1] = dateArray[1] - 1;
			// i have to convert the year to the correct century
			if (dateArray[2] < 100)
			{
				dateArray[2] = parseInt(dateArray[2], 10) + 2000; // will make the value in the year 2000 something
			}
			inputDate = new Date();
			inputDate.setFullYear(dateArray[2], dateArray[1], dateArray[0]);
			// round to the nearest day
			inputDate = Math.round(inputDate.getTime() / (1000 * 60 * 60 * 24)); // convert input time (sec) to number of days
			currentTime = new Date();
			// round to the nearest day
			currentTime = Math.round(currentTime.getTime() / (1000 * 60 * 60 * 24)); // convert current time (sec) to number of days
			// I now have days since 1 jan 1970, test which is bigger and then return boolean
			if (inputDate > currentTime)
			{
				return 'future';
			}
			else if (inputDate < currentTime)
			{
				return 'past';
			}
			else
			{
				return 'today';
			}
		},
		option : function(args) {
			this.opts = $.extend(true, {}, this.opts, args);
		},
		destroy : function() {
			this.el.unbind("."+this.namespace);
		}
	};
	
	// the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
	// props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
	$.fn.validator = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "validator",
			args;
		
		// if the argument is a string representing a plugin method then test which one it is
		if ( typeof options === 'string' ) {
			// define the arguments that the plugin function call may make 
			args = Array.prototype.slice.call( arguments, 1 );
			// iterate over each object that the function is being called upon
			this.each(function() {
				// test the data object that the DOM element that the plugin has for the DOM element
				var pluginInstance = $.data(this, pluginName);
				
				// if there is no data for this instance of the plugin, then the plugin needs to be initialised first, so just call an error
				if (!pluginInstance) {
					alert("The plugin has not been initialised yet when you tried to call this method: " + options);
					return;
				}
				// if there is no method defined for the option being called, or it's a private function (but I may not use this) then return an error.
				if (!$.isFunction(pluginInstance[options]) || options.charAt(0) === "_") {
					alert("the plugin contains no such method: " + options);
					return;
				}
				// apply the method that has been called
				else {
					pluginInstance[options].apply(pluginInstance, args);
				}
			});
			
		}
		// initialise the function using the arguments as the plugin options
		else {
			// initialise each instance of the plugin
			this.each(function() {
				// define the data object that is going to be attached to the DOM element that the plugin is being called on
				var pluginInstance = $.data(this, pluginName);
				// if the plugin instance already exists then apply the options to it. I don't think I need to init again, but may have to on some plugins
				if (pluginInstance) {
					pluginInstance.option(options);
					// initialising the plugin here may be dangerous and stack multiple event handlers. if required then the plugin instance may have to be 'destroyed' first
					//pluginInstance.init(callback);
				}
				// initialise a new instance of the plugin
				else {
					$.data(this, pluginName, new $.Validator(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);

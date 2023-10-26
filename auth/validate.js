
var Validator = (function () {
    'use strict';
    return class Validator {
        /**
         * Negative checks alpha numeric
         * characters including space
         * and period (.).
         */
        static REG_SPECIAL = /[^\p{L}0-9\s.]/u;
        static imgMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            // 'image/gif',
            'image/bmp',
            'image/webp'
        ];
        /**
         * @param {object} rules In this object key would be input name
         * attribute and value would be either a string or an array. 
         * An input can have multiple rules. 
         * Sending rules as a string after rulename you can add any
         * rule constraint you want like in min case you need 
         * to tell how much mimnimum characters are bearable in
         * username like 4
         * rules : {
         *      username: 'required|min:4|max:12
         * }
         * As an array you can either pass pre configured
         * static names for rules but remember that they are not
         * configured for all types of rules to keep the library
         * size smaller. Like image rule can only be send inside
         * an array becuase it has an array of possible
         * mime types for the images.
         * rules :{
         *      username : [
         *                      Validator.RULE_REQUIRED, 
         *                      [
         *                          min, 
         *                          6
         *                      ], 
         *                      [
         *                          'image', 
         *                              [
         *                                  image/png', 
         *                                  'image/jpeg'
         *                              ]
         *                      ]
         *                  ]
         * }
         * @param {object} errorMessages There are two ways to pass your error messages 
         * as one is by creating sub-object recommended 
         * when you have multipke rules for a single 
         * input and the second one is by using concatenated 
         * name like this if your input field has a name attribute
         *  "username" and you 
         * want to just send the error message for min error 
         * you can do it like this "username_min":"message" 
         * Example of first method
         * errorMessages : {
         *    username : {
         *        min : "message",
         *        max : "message"  
         *     },
         *      otherinput : {
         *         min : "message"
         *      }
         * }
         * Example of second way It is recommended for when input has only one rule but if you 
         * want you can use it with as many rules as you want.
         * 
         * errorMessages : {
         *      username_min : "message"
         *      username_max : "Here max is rule name underscore is just for seperation and you
         * can have as many underscore as you want in name attribute.",
         *      otherinput_min : "message"
         * }
         * Some error messages names are not same as 
         * functions they are listed here
         * so if you want to pass your custom
         * error messages for that rules you
         * can do it easily.
         * 
         * 1) alpha and alphaNumeric with spaces:
         * 
         * If you want to allow space inside alpha and alphaNumeric
         * fields then you can pass it's error 
         * messages key appended with
         * _s.
         * like alpha_s, and alphanumeric_s
         * 
         * 2) url function :
         * 
         * for url function if you want to allow ftp urls
         * it error message should has a key url_ftp. 
         * and pass rules like this {input : "url:1"},
         * 
         * 3) Password :
         * There is no error message for password itself 
         * it uses these functions to validate password
         * i) hasLowerCase
         * ii) hasUpperCase
         * iii) hasDigit
         * iv) min
         * v) hasSpecial
         * So in order to use password you need to pass error 
         * messages with these functions name like
         * {hasLowerCase: "Your password should have a lowrcase character."}
         * If you don't want to pass this many 5 error messages
         * then you can just pass a single one with password key
         * like this:
         * First way : 
         * {
         *      input : {
         *              password : "Msg"
         *              }
         * }
         * Second way : 
         * {
         *      input_password : "Msg"
         * }
         * here input is name attribute of your password input and password
         * is rule name which is appended with "_".
         * 
         * Last Image rule dimension error messsages settings.
         * Dimension rule has many sub attributes like width, height.
         * Way of giving error for this
         * First way
         * like this 
         * {
         *      input : {
         *          dimension : {
         *                  width : "The width should be 80 px",
         *                  height : "The height should be 90px."
         *          }
         *      }
         * }
         * Second way
         * {
         *     input_dimesnion_width : "The width should be 80 px",
         *     input_dimension_height : "The height should be 90px."
         * 
         * }
         * @param {FormData | object | null} [dataToValidate=null] data
         * which
         * should be validated
         */
        constructor(rules, errorMessages = {}, dataToValidate = null) {
            this.customMessages = errorMessages;
            this.rules = rules;
            this.data = dataToValidate;
            this.errors = {};
        }
        /**
         * Sets the static property of 
         * REG_SPECIAL
         * @param {RegExp} regex 
         */
        static setRegexSpecial(regex) {
            Validator.REG_SPECIAL = regex;
        }
        /**
         * @param {object} rule
         */
        setRules(rules) {
            this.rules = rules;
            return this;
        }
        /**
         * @param {object} customErrorMessages 
         * @returns 
         */
        setErrorMessages(customErrorMessages) {
            if (this.customMessages) {
                this.customMessages = { ...this.customMessages, ...customErrorMessages };
            } else {
                this.customMessages = customErrorMessages;
            }
            return this;
        }
        static setImgMimeTypes(imgMimeTypes) {
            Validator.imgMimeTypes = imgMimeTypes;
        }
        static get RULE_REQUIRED() {
            return 'required';
        }

        static get RULE_MIN() {
            return 'min';
        }
        static get RULE_MAX() {
            return 'max';
        }

        static get RULE_MATCH() {
            return 'matchcase';
        }

        static get RULE_EMAIL() {
            return 'email';
        }

        static get RULE_UNIQUE() {
            return 'unique';
        }

        static get RULE_SPECIAL() {
            return 'special';
        }

        static get RULE_NOTSPECIAL() {
            return 'noSpecial';
        }

        static get RULE_DIGIT() {
            return 'digit';
        }

        static get RULE_NODIGIT() {
            return 'no_digit';
        }

        static get RULE_SPACE() {
            return 'space';
        }

        static get RULE_NOSPACE() {
            return 'noSpace';
        }

        static get RULE_LOWERCASE() {
            return 'lowerCase';
        }

        static get RULE_UPPERCASE() {
            return 'uppercase';
        }

        static get RULE_ONLYDIGIT() {
            return 'only_digit';
        }

        static get RULE_MAXNUMB() {
            return 'maxNumb';
        }

        static get RULE_MINNUMB() {
            return 'minNumb';
        }

        static get RULE_TILLDATE() {
            return 'tillDate';
        }

        static get RULE_SHOULD_OLD() {
            return 'shouldOld';
        }
        //-------------------------------DATE RESOLVERS------------------------------\\
        /**
         * Gives a utc date for a normal date
         * @param {Date | null} date 
         */
        static getUtcDate(date = null) {
            if (!date) date = new Date();
            const now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
                date.getUTCDate(), date.getUTCHours(),
                date.getUTCMinutes(), date.getUTCSeconds());
            return new Date(now_utc);
        }
        /**
         * Resolve howManyYears and give a utc calculated date 
         * @param {Number | Date | String | null} howManyYears 
         * @returns {Date}
         */
        static getDate(howManyYears) {
            let pastDate;
            if (typeof howManyYears === 'number') {
                pastDate = Validator.getUtcDate();
                pastDate.setUTCFullYear(pastDate.getUTCFullYear() - howManyYears);
                pastDate.setUTCHours(0, 0, 0, 0);
            } else if (typeof howManyYears === 'string') {
                pastDate = new Date(howManyYears);
                pastDate = Validator.getUtcDate(pastDate);
            } else if (howManyYears instanceof Date) {
                pastDate = howManyYears;
            } else {
                //pass current date
                pastDate = Validator.getUtcDate();
            }
            return pastDate;
        }
        /**------------------EXTENDERS FOR INPUTS--------------------*/
        /** 
         * Sets the max attribute for your input element date like if you want the user to
         * select only between 2005 16 october it can do this for you.
         * @param {string|HTMLInputElement} selector 
         * @param {null|Date|Number} [toDate=null] In number case it should be years count 
         */
        static setMaxdate(selector, toDate = null) {
            let input = SubmitForm.selectElem(selector, HTMLInputElement, true);
            let max = Validator.getDate(toDate);
            input[0].max = max.toISOString().split('T')[0];
        }
        /**
         * Set the field a valid number 
         * @param {string|HTMLElement} selector 
         * @param {false|Number} [setMax=false] The max number which is allowed 
         * as input
         */
        static setNum(selector, setMax = false) {
            let input = SubmitForm.selectElem(selector, HTMLElement, true);
            input.on('input', function () {
                let s = input.val();
                input.val(s.replace(/\D/g, ''))
                if (setMax && s > setMax) {
                    input.val(s.slice(0, s.length - 1));
                }
            });
        }
        /**
         * Set the Input as a formatted phone number input
         * @param {string|HTMLInputElement|HTMLTextAreaElement} selector - Selector or 
         * element to format.
         * @param {boolean} [allowCode=false] - Whether to allow country codes.
         * @param {number} [numCount=10] - Maximum number of digits allowed in 
         * the phone number.
         * @param {number[]} putSpaces - Array of positions where spaces should be added.
        */
        static setPhone(selector, allowCode = false, numCount = 10, putSpaces = [2, 5]) {
            let input = SubmitForm.selectElem(selector, HTMLElement, true);
            input.on('input', function (e) {
                let val = '', newVal = '', changePlus = false;
                if (!allowCode)
                    // \D would match with any non-digit characters
                    val = input.val().replace(/\D/g, '');
                else {
                    numCount = (numCount === 10) ? 13 : numCount;
                    val = input.val().replaceAll(/[^0-9+]/g, '');
                    if (!val.includes('+')) {
                        newVal = '+';
                        changePlus = true;
                        // return;
                    }
                }

                for (let i = 0; i < Math.min(val.length, numCount); i++) {
                    if (allowCode && newVal.includes('+') && val[i] == '+') continue;
                    newVal += val[i];
                    if (putSpaces.includes(i))
                        newVal += ' ';
                }
                //removes the extra spaces from the end of inputs
                if (!changePlus && newVal === "+") newVal = '';
                input.val(newVal.trimEnd());

            });
        }
        /**
         * @param {Date} date Date instansce
         * @returns {string} formated string of date and time
         */
        formatDateTimeWithAMPM(date) {
            const months = [
                "January", "February", "March", "April",
                "May", "June", "July", "August",
                "September", "October", "November", "December"
            ];
            let hours = date.getUTCHours(),
                minutes = date.getUTCMinutes(),
                ampm = hours >= 12 ? 'pm' : 'am';

            // Convert hours to 12-hour format
            hours = hours % 12;
            hours = hours ? hours : 12; // 12 should be displayed as 12:00 PM, not 00:00 AM

            // Add leading zeros to minutes if needed
            minutes = minutes < 10 ? '0' + minutes : minutes;
            const formattedDateTime = `${date.getUTCDate()} ${months[date.getUTCMonth()]},${date.getUTCFullYear()} till ${hours}:${minutes} ${ampm}`;
            return formattedDateTime;
        }
        /**
         * Set up live form validation based on provided 
         * rules and custom error messages.
         * @param {object} obj maybe just rules or an obect containing rules and 
         * errorMsgs 
         * @property {object} rules - Rules for validation.
         * @property {object|undefined} [errorMsgs=undefined] - Custom error messages
         * for validation rules.
         * @property {function|null} [callback=null] - Callback function to 
         * execute on validation errors. Default is null if you don't provide any
         * function it would use showErrors function. If you provide a function 
         * liveverifier would pass 
         * 3 parameters inside your callback
         * i) First would be key which is name of the current input you 
         * pass inside rule 
         * ii) Second would be errors object
         * which would contain errors for all inputs.
         * iii) Third would be rules itself well it looks
         * like why to pass rules when I gave it. Well 
         * rules would help you to verify that 
         * a particular input name has rules object
         * but errors object doesn't have it's name
         * so you can understand that it is a valid 
         * field.
         * @throws {TypeError} - If callBack is not a function.
        */

        static liveVerify(obj) {
            let rules;
            if (!obj.hasOwnProperty('rules')) {
                rules = obj;
            } else {
                rules = obj.rules;
            }
            let verify = new Validator(rules, (obj?.errorMsgs || {}));
            let callback = obj?.callback;
            if (!callback) {
                callback = verify.showErrors.bind(verify);
            }
            else if (typeof callback !== 'function') throw new TypeError("callback paratemer needs to be a function");
            for (const key in verify.rules) {
                if (verify.rules.hasOwnProperty(key)) {
                    let input = $(`[name="${key}"]`),
                        rule = verify.resolveRule(key);
                    input.on('blur focus', function () {
                        if (rule.includes('required')) {
                            /**
                              * On file case making val null because
                              * required function would select file by 
                              * itself.
                              */
                            let val = (input[0].type === 'file') ? null : input.val();
                            if (verify.required(val, null, key) == 0) {
                                verify.putError(key, 'required');
                                callback(key, verify.errors, verify.rules, this);
                            };
                        }
                    });

                    input.on('input', async function () {
                        let i = await verify.verify(input.val(), key, rule);
                        if (i === 2) {
                            /**
                             * Verifier did not found any error 
                             * inside this field.
                            */
                            if (verify.errors.hasOwnProperty(key)) {
                                delete verify.errors[key];
                            }
                        }
                        callback(key, verify.errors, verify.rules, verify);
                    });
                }
            }
        }


        //--------------------Returns file size in human readable format-------------------\\
        static getfileSize(size) {
            if (size < 1024) {
                return size + ' bytes';
            } else if (size < 1024 * 1024) {
                const sizeInKB = size / 1024;
                return sizeInKB % 1 === 0 ? sizeInKB + ' kb' : sizeInKB.toFixed(2) + ' kb';
            } else if (size < 1024 * 1024 * 1024) {
                const sizeInMB = size / (1024 * 1024);
                return sizeInMB % 1 === 0 ? sizeInMB + ' mb' : sizeInMB.toFixed(2) + ' mb';
            } else if (size < 1024 * 1024 * 1024 * 1024) {
                const sizeInGB = size / (1024 * 1024 * 1024);
                return sizeInGB % 1 === 0 ? sizeInGB + ' gb' : sizeInGB.toFixed(2) + ' gb';
            } else {
                const sizeInTB = size / (1024 * 1024 * 1024 * 1024);
                return sizeInTB % 1 === 0 ? sizeInTB + ' TB' : sizeInTB.toFixed(2) + ' TB';
            }
        }
        //------------------------Validator Extender-----------------------------\\
        /**
         * Add a function inside the validator
         * @param {Function} callback 
         * @param {string} ruleName 
         * @param {string} errorMessage 
         * @returns {this}
         * @throws TypeError
         */
        addFunc(callback, ruleName, errorMessage) {
            if (typeof callback === "function") {
                if (typeof ruleName !== 'string' || typeof errorMessage !== 'string') throw new TypeError("You must provide ruleName and errorMessage for your function", callback);
                if (typeof Validator.prototype[ruleName] === 'function') throw new TypeError("A rule with this name already exists kindly rename of your rule.");
                Validator.prototype[ruleName] = callback;
                Validator.prototype.errorMessages = { ...Validator.prototype.errorMessages, ruleName: errorMessage };
            }
            throw new Error(`${ruleName} does not refer to a function`);
        }
        /**
         * @param {Function|object} callback If you pass a
         * function here then next parameter till errorMessage
         * must not be null, Every function you pass must
         * should either return 1 or 0 or 2 (check details down below).
         * 
         * In object case you can pass as many function as you
         * want inisde that object
         * like this 
         * {    
         *      ruleName : {
         *           callback : function(value, extras, key){
         *                  return value.trim().length;
         *          },
         *          msg : "This field can't be empty"
         *      }
         * }
         *
         * Parametrs Defination of callback:
         * 1) value:
         * here value would be the input value where your applying rule
         * 2) extras : 
         * extras would be null, object , string, bool
         * basically extras are when you pass something
         * with your rule as a constraint like this
         * "min:6" here 6 is a extra
         * dimension : {
         *          width : 80px, 
         *          height : 100px  
         *     }
         * here whole object of dimension is extra 
         * like this {width : 80px, height : 100px}
         *
         * 3) key:
         * would be name attribute of your input
         * 
         * 4) Return Values defination:
         *
         * i) 1:
         * When your function would return one it means current rule
         * didn't found any error.
         *
         * ii) 2:
         * When your function would return 2 it means it has added it 
         * error in the errors object and after this the validator
         * won't run any rule on your input because input already
         * has an error. You can use putError function to put
         * any errors inside error object. 
         * @see putError
         *
         * iii) 0 or false
         * It means you rule has found error and then no other rule
         * would apply on your input. The main difference b/w 2 and 0
         * is that in 0 case verifier would add its error in
         * errors object by itself and in 2 case you need
         * to add your own error.
         * 
         * @param {string|null} [ruleName=null] Rule name of your
         * custom rule like required, email
         * @param {string|null} errorMessage Error message for your rule
         * Validator or null which is default
         */
        static extend(callback, ruleName = null, errorMessage = null) {
            if (typeof callback === 'function') {
                Validator.prototype.addFunc(callback, ruleName, errorMessage);
            } else {
                for (const key in callback) {
                    if (callback.hasOwnProperty(key)) {
                        Validator.prototype.addFunc(callback[key].callback, key, callback[key].msg);
                    }
                }
            }
        }

        //--------------------WORK WITH ERROR MESSAEGS Data----------------------\\

        get errorMessages() {
            return {
                alpha: "This field needs to contain only alphabatic characters i.e A to z.",
                alpha_s: "This field can only have only alphabatic characters i.e A to z and space",
                alphaNumeric: "This field can only contain alphanumeric characters.",
                alphaNumeric_s: "Thie fields can only contain alphanumeric characters and space.",
                date: 'Please enter a valid date in the format YYYY-MM-DD.',
                dateALL: 'Please enter a valid date',
                dateTime: 'Please enter a valid date and time in the format YYYY-MM-DD HH:MM:SS.',
                required: 'This field is required.',
                email: 'Please provide a valid email address.',
                // [Validator.RULE_MATCH]: 'This should match with the {match}.',
                min: 'The field should contain a minimum of {min} characters.',
                max: 'The field should contain a maximum of {max} characters.',
                // [Validator.RULE_SPECIAL]: 'This field must contain a special character such as $, #, %, or @.',
                noSpecial: 'This field should not contain any special characters like $, #, &, @, or >.',
                space: 'This field must contain at least one space.',
                noSpace: 'This field should not contain any spaces.',
                lowerCase: 'This field should contain lowercase letters.',
                upperCase: 'This field should contain uppercase letters.',
                numb: 'This field should contain only digits.',
                maxnumb: 'This field should not exceed {max} digits.',
                minnumb: 'This field should contain at least {min} digits.',
                tillDate: 'The date of this field should be selected before {tillDate}.',
                shouldOld: 'Age Requirement: You must be at least {shouldOld} years old to access this feature/content.',
                fileSize: 'The maximum allowed file size is {fileSize} and your file size is {fileSize2}.',
                fileType: 'The allowed file types are {fileType}',
                image: 'The uploaded file is not a valid image. Allowed image types are {image}.',
                fileExt: 'The file is not of valid type allowed file types are {fileExt}.',
                dimension_equal: 'The uploaded image has a width of {givenWidth}px and height of {givenHeight}px, while the required dimensions are {expectedWidth}x{expectedHeight} pixels.',
                dimension_smallest: 'The smallest accepted width and height are {expectedWidth}x{expectedHeight} pixels, but your image is smaller than that, {givenWidth}x{givenHeight}.',
                dimension_highest: 'The largest accepted width and height are {expectedWidth}x{expectedHeight} pixels, but your image is larger than that, {givenWidth}x{givenHeight}.',
                dimension_width: 'The expected width for this image is {width}px.',
                dimension_height: 'The expected height for this image is {height}px.',
                dimension_square: 'This image needs to be a square, meaning it should have the same height and width, like 500x500 pixels.',
                dimension_square_size: 'This image needs to be square with a width and height of {expectedWidth}x{expectedHeight} pixels.',
                dimension_aspectRatio: 'The image must have an aspect ratio of {aspectRatio}.',
                detectMultipleSpaces: 'This field has multiple consecutive spaces.',
                accept: 'Please check this checkbox.',
                range: 'The entered number must be between {num1} to {num2}.',
                numb: 'This field needs to be a valid number without any space',
                numb_space: 'This field needs to be a valid number.',
                numb_space_double: 'This field contains more spaces then it should.',
                password: 'This field needs to contain small case, uppercase, special characters i.e $,#,% etc and digits characters and has a length of atleast {password} characters.',
                hasLowerCase: 'The field needs to have a lower case character.',
                hasUpperCase: 'The field needs to have a upper case character.',
                hasSpecial: 'The field needs to have a special character like $, #, @, & etc.',
                hasDigit: 'The field needs to have a numeric digit [0-9].',
                same: 'This field must match with the {same}.',
                inList: 'The field must be of any of these {inList}.',
                url: "Please enter a valid HTTP or HTTPS URL.",
                url_ftp: "Please enter a valid HTTP or HTTPS or FTP URL.",
                zipCode: "Please enter a valid ZIP/Postal code.",
                json: "The provided JSON structure is not valid.",
                ipv4: "Please enter a valid IPv4 address.",
                ipv6: "Please enter a valid IPv6 address.",
                isbn: "Please enter a valid ISBN (ISBN-10 or ISBN-13).",
                upc: "Please enter a valid UPC (Universal Product Code).",
                ean: "Please enter a valid EAN (European Article Number)."
            };
        }
        getUserError(key, ruleName) {
            return this.customMessages?.[key]?.[ruleName] || this.customMessages?.[`${key}_${ruleName}`];
        }
        getError(key, ruleName, defaultMessage = "An unknown error occured.") {
            return this.getUserError(key, ruleName) || this.errorMessages?.[ruleName] || defaultMessage;
        }
        /**
         * @param {string} key Name input for 
         * @param {string} ruleConstraint real rule name 
         * of dimension like width, height, square etc.
         * Way of giving error for this
         * like this 
         * First way
         * {
         *      input : {
         *          dimension : {
         *                  width : "The width should be 80 px",
         *                  height : "The height should be 90px."
         *          }
         *      }
         * }
         * Second way
         * {
         *     input_dimesnion_width : "The width should be 80 px",
         *     input_dimension_height : "The height should be 90px."
         * 
         * }
         */
        getDimensionError(key, ruleConstraint, replaceMents = {}, ruleName = 'dimension') {
            return this.customMessages?.[key]?.[ruleName]?.[ruleConstraint] || this.customMessages?.[`${key}_${ruleName}_${ruleConstraint}`] || Validator.strReplace(this.errorMessages[`${ruleName}_${ruleConstraint}`], replaceMents);
        }
        resolveDimensionErrors(key, errorSubName, array, width, height) {
            console.log("Adding dimension error", key);
            this.errors[key] = this.getDimensionError(key, errorSubName, { givenWidth: width, givenHeight: height, expectedWidth: array[0], expectedHeight: array[1] });
        }

        //--------------------------Adding errors-------------------------------\\
        /**
         * 
         * @param {string} attribute Input name attr
         * @param {string} ruleName The rule which caused the error
         * @param {array|string|null} extras any data related to this rule to
         * show in error msg
        */
        addError(attribute, ruleName, extras = null) {
            let message = this.getError(attribute, ruleName);
            if (extras) {
                console.log("Extras ", extras, ruleName);
                let msg = extras;
                switch (ruleName) {
                    case 'tillDate':
                        if (typeof extras === 'number') extras = -extras;
                        msg = this.formatDateTimeWithAMPM(Validator.getDate(extras));
                        break;
                    case 'shouldOld':
                        if (extras instanceof Date) msg = extras.getUTCFullYear();
                        break;
                    case 'image':
                    case 'fileType':
                    case 'inList':
                    case 'fileExt':
                        /**
                         * This time extras are array
                         * @var extras {array}
                         */
                        msg = extras.join(', ');
                        break;
                }
                message = message.replace(`{${ruleName}}`, msg);
            }
            this.errors[attribute] = message;
        }
        /**
         * Add errors in errors object with replacements
         * @see strReplace
         * @returns {2}
         */
        putError(key, ruleName, replaceMents = null, curlyBraces = true) {
            if (!replaceMents) this.errors[key] = this.getError(key, ruleName);
            else this.errors[key] = Validator.strReplace(this.getError(key, ruleName), replaceMents, curlyBraces);
            return 2;
        }
        /**
         * Gets all errors from error object
         * @returns {object}
         */
        getErrors(){
            return this.errors;
        }
        /**
         * A string replacer for adding errors
         * @param {string} str 
         * @param {object} replaceMents key should be placeholder/search Value and
         * value should be replacing string
         * @param {boolean} [curlyBraces=true] if you pass a placeholder
         * in error message like this {min} then in replacements you just 
         * need to pass min it would automatically make it {min}
         * if it false then it won't do this. So curlyBraces means true
         * means to add the curly braces around your placeholder like
         * you have an error message like this
         * max : "This field should contain {max} characters."
         * So here max is inside curlybraces {}.
         * to replace this with help of this function 
         * you can easily pass it like this
         * Validator.strReplace(Validator.errorMessages['max'], {max : 90})
         * no need to pass like this {['{max}'] : 90}
         */

        static strReplace(str, replaceMents, curlyBraces = true) {
            for (const key in replaceMents) {
                if (replaceMents.hasOwnProperty(key))
                    if (curlyBraces)
                        str = str.replace(`{${key}}`, replaceMents[key]);
                    else
                        str = str.replace(key, replaceMents[key]);
            }
            return str;
        }
        //---------------------SHOWING ERRORS---------------------\\

        addOrRemoveClass(key, message, addClass = false) {
            let elem = $(`[name="${key}"]`);
            elem.removeClass('is-invalid');
            elem.next().filter('.invalid-feedback')?.remove();
            if (addClass) {
                elem.addClass('is-invalid');
                elem.after(`<div class="invalid-feedback"><span class="text-danger">${message}</span></div>`);
            }
        }
        baseShowErrors(key) {
            if (this.errors.hasOwnProperty(key)) {
                console.log("error has key", key);

                /**
                 * This field is not valid because errors object 
                 * contains it keys.
                 */
                this.addOrRemoveClass(key, this.errors[key], true);
            }
            else if (this.rules.hasOwnProperty(key)) {
                /**
                 * It means it is a valid field
                 */
                this.addOrRemoveClass(key);
            }
        }
        showErrors(key = null) {
            if (key) this.baseShowErrors(key);
            else {
                for (const key in this.rules) {
                    this.baseShowErrors(key);
                }
            }
        }

        //----------------Validators which run rules-----------------------\\

        /**
         * @param {object} obj can either only contain datatoValidate
         * or can also have rules and custom error messages etc.
         * @property {object|FormData} data | 
         * @param {object} rules 
         * @param {object | null} errorMsgs 
         * @param {Function|null} [callback=null] if you give give callback as a function
         * then it must accept a single parameter an object of errors keys would be 
         * input names and values would be error messages. If it is null then it would 
         * automatically show errors.
         */
        static async verifyData(obj, formValidator = null) {
            console.log("Inside verifydata ", obj, formValidator);
            let verify, callback = obj?.callback;
            if (obj.hasOwnProperty('rules')) {
                /**
                 * If rule is passed inside obj paramter
                 * then we need to get both rules and errorMessages from here 
                 * otherwise we would insert data inside Validator parameter.
                 */
                verify = new Validator(obj.rules, (obj?.errorMsgs || {}), obj.data);
            } else if (formValidator instanceof Validator) {
                verify = formValidator
                verify.data = obj.data;
            }
            let value;
            if (verify.data instanceof FormData) {
                console.log("Inside verify data rules", verify.rules);
                for (const key in verify.rules) {
                    value = verify.data.getAll(key);
                    console.log("Value ", value);
                    let outPut = await verify.verify(value, key, verify.resolveRule(key));
                    if (outPut) continue; //This input either has error or undefined rules so move on to next input
                }
            }
            else if (typeof verify.data === 'object') {
                for (const key in verify.rules) {
                    value = verify.data[key];
                    let outPut = await verify.verify(value, key, verify.resolveRule(key));
                    if (outPut) continue;
                    // else break; 
                }
            }
            let bool = verify.isFailed();
            if (!bool) {
                if (typeof callback === 'undefined') {
                    verify.showErrors();
                } else if (typeof callback === 'function') {
                    callback(verify.errors, verify.rules, verify);
                } else {
                    throw new TypeError("The given callback needs to be a function.");
                }
            }
            return bool;
        }
        /**
         * Is validation passes or fails
         * @returns {boolean} true on validation passes and false on validation fails
         */
        isFailed() {
            return Object.keys(this.errors).length === 0;
        }
        /**
         * 
         * @param {FormDataEntryValue|string} value 
         * @param {string} key Name of the input where to apply rule
         * @param {boolean|Array} [rules] Array of rules to verify
         * @returns {Promise<2|1>} 1 when error is found and 2 when no 
         * error was found
         *
        */
        async verify(value, key, rule) {
            if (typeof rule === 'undefined') return 2; //Means no rule for this input so continue
            console.log("dimension", rule);


            if (Object.keys(value).length === 0 || typeof value === 'undefined') {
                console.log("inside object", key);
                /**
                 * Value is undefined means no input exists with this key 
                 * but what about checkbox if checkbox is not checked it won't
                 * appear in formdata means value length would be evaluated
                 * as 0
                 */
                let elem = $(`[name='${key}']`);
                // rule = this.resolveRule(rule);
                if (elem.length === 1) {
                    if (rule?.includes('accept')) {
                        if (!elem.prop('checked')) {
                            console.log(elem)
                            this.addError(key, 'accept');
                        }
                        return 1;
                    }
                } else {
                    throw new TypeError(`No input exists with this name ${key}`);
                }
            }

            for (const r of rule) {
                let ruleName = r, extra = null;
                if (typeof r === 'string') {
                    if (r.includes(':')) {
                        [ruleName, extra] = r.split(':');
                    }
                }
                else if (typeof r === "object") {
                    for (let key in r) {
                        ruleName = key;
                        extra = r[key];
                    }
                }
                if (typeof this[ruleName] === 'function') {
                    if (typeof value === 'string') {
                        let i = await this.baseVerifier(ruleName, key, extra, value);
                        if (i === 1) return 1;
                        else if (i === 2) continue;
                    } else {
                        for (let v of value) {
                            /**
                             * Appliying rule one by one on an input.
                             */
                            let i = await this.baseVerifier(ruleName, key, extra, v);
                            if (i === 1) return 1;//error is added so move on next field
                            else if (i === 2) continue;//Means no error found

                        }
                    }
                }
            }
            return 2;
        }
        /**
         * Base rule verifier verify one rule at a time 
         * @param {string} ruleName like required, accept
         * @param {string} key name attribute of an input
         * @param {string|object|null} extra default is null
         * @param {string|File} v Can either be a string value or
         * a single file to verify
         * @returns {1|2} 1 when error got found in an input
         * 2 when no error could be found.
         */

        async baseVerifier(ruleName, key, extra, v) {
            /**
             * Appliying rule one by one on an input.
             */
            console.log("Inside loop Rulename ", ruleName, key);
            if (ruleName !== 'required' && typeof v === 'string' && v.trim().length === 0) return 2;
            let bool = await this[ruleName](v, extra, key);
            switch (bool) {
                case false:
                case 0:
                    /**
                    * It means this field has error;
                    */
                    this.addError(key, ruleName, extra);
                    return 1;
                case 2:
                    /**
                     * When a rule would add the error by itself 
                     * it would return true because some rules
                     * are pretty painful for addError like
                     * dimension
                     */
                    return 1;
            }
            return 2;
        }
        /**
         * Get rule as an array if it is string
         * @param {string|Array} rule User given rule
         * @returns {Array}
         */
        resolveRule(key) {
            if (typeof this.rules[key] === 'string') {
                return this.rules[key].split('|');
            }
            return this.rules[key];
        }
        /**
         * Returns the data specific for rule by data object or input value or files
         * @param {string} key 
         * @param {boolean} [all=false]  In case of array of fileList it just
         * returns element at 0 index if you want to get the complete array
         * and filelist make it true
         * @returns {Array|FileList|string}
         */
        getData(key, all = false) {
            if (this.data instanceof FormData) {
                if (!all)
                    return this.data.get(key);
                return this.data.getAll(key);
            }
            else if (this.data) {
                if (!all && (this.data[key] instanceof FileList || Array.isArray(this.data[key])))
                    return this.data?.[key][0];
                return this.data[key];
            }
            let e = SubmitForm.selectElem(`[name="${key}"]`, HTMLElement);
            if (e.type === 'file') {
                if (all) return e.files;
                return e.files?.[0];
            }
            return e.value;

        }
        checkNumber(numb, ruleName) {
            numb = Number(numb);
            if (isNaN(numb)) throw new TypeError(`In ${ruleName} you didn't pass a valid number to validate this rule.`);
            return numb;
        }
        checkFile(value) {
            return value instanceof File && value !== 'pplication/octet-stream';
        }
        /**---------------------------------Rules start from here-------------------*/

        //----------------------RULE OF CHECKBOX------------------------\\
        accept(value) {
            return value === 'on';
        }

        /**---------------------RULES OF STRING------------------------*\
        /**
         * Allow only alpha characters
         * @param {string} value 
         * @param {bool|null} allowSpace by default it is null to make it true you 
         * can make it 1 which would allow spaces in alpha field
         * @returns 
        */
        alpha(value, allowSpace) {
            if (allowSpace) return /^[\p{L}\s]+$/u.test(value);
            return /^[\p{L}]+$/u.test(value);
        }
        alphaNumeric(value, allowSpace) {
            if (allowSpace) return /^[\p{L}\p{N}\s]+$/u.test(value);
            return /^[\p{L}\p{N}]+$/u.test(value);
        }
        lowerCase(value, allowSpace) {
            if (allowSpace)
                return /^[\p{Lowercase}\s]+$/u.test(value)
            return /^[\p{Lowercase}]+$/u.test(value);
        }
        upperCase(value, allowSpace) {
            if (allowSpace)
                return /^[\p{Uppercase}\s]+$/u.test(value)
            return /^[\p{Uppercase}]+$/u.test(value);
        }
        /**
         * Detect consective and multiple spaces at once in string
         * "  " like this
         * @param {string} value 
         * @param {string} ruleName 
         * @param {string} key 
         * @returns {1|2} 1 when no error is found to when it has put it
         * its own error.
         */
        detectMultipleSpaces(value, extra, key, ruleName = 'detectMultipleSpaces') {
            let bool = value.replace(/\s+/g, ' ') === value;
            if (!bool) {
                return this.putError(key, ruleName);
            }
            return bool;
        }
        email(value) {
            return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
        }
        hasLowerCase(value) {
            return /[\p{Lowercase}]/u.test(value);
        }
        hasUpperCase(value) {
            return /[\p{Uppercase}]/u.test(value);
        }
        hasSpecial(value) {
            return Validator.REG_SPECIAL.test(value);
        }

        noSpace(value) {
            return !/\s+/g.test(value);
        }
        noSpecial(value) {
            return !(Validator.REG_SPECIAL.test(value));
        }
        max(value, max) {
            return !(value.trim().length > max);
        }
        min(value, min) {
            return !(value.trim().length < min);
        }
        /**
         * Rule is useful when you want to confirm a field
         * like password
         * @param {string} value 
         * @param {string} toMatchkey Name attribute of input with
         * which you want to match this input value.
         * @returns 
         */
        same(value, toMatchkey) {
            let data = this.getData(toMatchkey);
            console.log("inside same ", value === data, value, data, toMatchkey);
            return value === data;
        }
        /**
         * Check for spaces inside a string
         * @param {string} value 
         * @param {true|1} detectMultiple you can pass this rule
         * like this input: "space" and also this way
         * input: "space:1" means here 1 would make this 
         * detectMultiple true and it would
         * detect consecutive space like this "  ".
         * @returns 
         */
        space(value, detectMultiple) {
            let regex = /\s+/g,
                bool = regex.test(value);
            if (bool && detectMultiple) {
                return this.detectMultipleSpaces(value, key);
            }
            return bool;
        }
        password(value, extra, key) {
            let errorName = false;
            if (!this.hasLowerCase(value)) {
                errorName = 'hasLowerCase';
            }
            else if (!this.hasUpperCase(value)) {
                errorName = 'hasUpperCase';
            }
            else if (!this.hasDigit(value)) {
                errorName = 'hasDigit';
            }
            else if (!this.hasSpecial(value)) {
                errorName = 'hasSpecial';
            }
            else if (!this.min(value, extra || 8)) {
                errorName = 'min';
            }
            if (errorName) {
                this.errors[key] = this.getUserError(key, errorName) || this.getUserError(key, 'password') || Validator.strReplace(this.errorMessages[errorName], { ['{min}']: (extra || 8), field: 'password' }, false);
                return 2;
            }
            return 1;
        }

        /**-----------------------RULES OF NUMBERS------------------------------------*/
        hasDigit(value) {
            return /[0-9]/.test(value);
        }
        minnumb(value, min) {
            return !(value > min);
        }
        maxnumb(value, max) {
            return !(value < max);
        }
        numb(value) {
            return /^[0-9]+$/.test(value);
        }
        /**
         * It allows the user to have space in their numbers
         * @param {String} value 
         * @param {string} strict if it is true or 1 then
         * it won't allow consecutive spaces.
         * @returns 
         */
        numb_space(value, strict, key) {
            value = value.trim();
            // if (value.length === 0) return true;
            let bool = /^[0-9 ]+$/.test(value);
            if (bool && strict) {
                this.detectMultipleSpaces(value, null, key, 'numb_space');
            }
            return bool;
        }
        range(value, range, key) {
            console.log("range", range);
            if (value.trim().length > 0 && (value < range[0] || value > range[1])) {
                return this.putError(key, 'range', { num1: range[0], num2: range[1] });
            }
            return 1;
        }
        //---------------RULES FOR DATES---------------------//
        /**
         * Age reuirement rule that user should be x years old to
         * access this
         * @param {String} value Compare dates by first converting a local date into utc date
         * @param {Number} howManyYears 
         * @returns {boolean}
         * @throws TypeError
         */
        shouldOld(value, howManyYears) {
            howManyYears = this.checkNumber(howManyYears, 'shouldrule');
            let dob = new Date(value);
            dob = Validator.getUtcDate(dob);
            let currentDate = Validator.getUtcDate();
            let userage = currentDate.getUTCFullYear() - dob.getUTCFullYear();
            return userage < howManyYears;

        }
        /**
         * Rules for future date and
         * can be applicable to past date with a negative sign
         * @param {string} value 
         */
        tillDate(value, futureDate) {
            /**
             * For future date we need to use 
             * - sign before year
             */
            if (typeof futureDate === 'number')
                futureDate = -futureDate;

            futureDate = Validator.getDate(futureDate);
            let inputDate = Validator.getUtcDate(new Date(value));
            /**
             * If user date is more then future date then return 
             * false
             */
            return !(inputDate.getTime() > futureDate.getTime());
        }
        /**
         * Validate a date formate
         * @param {string} value 
         * Allowed formates are:
         * 1) YYYY-DD-MM default
         * 2) YYYY/DD/MM
         * 3) MM/DD/YYYY
         * 4) DD/MM/YYYY
         * 5) YYYY-MM-DD
         * 
         */
        dateAll(value) {
            return this.date(value) || this.date(value, "YYYY/DD/MM") || this.date(value, "MM/DD/YYYY") || this.date(value, "DD/MM/YYYY") || this.date(value, "YYYY-MM-DD");
        }
        /**
         * Validate a date 
         * @param {string} value 
         * Allowed formates are:
         * 1) YYYY-DD-MM this is default format
         * 2) YYYY/DD/MM
         * 3) MM/DD/YYYY
         * 4) DD/MM/YYYY
         * 5) YYYY-MM-DD
         */
        date(value, extra) {
            let format = "YYYY-DD-MM";
            if (extra) format = extra
            /**
             * The default format is YYYY-DD-MM
             * @var monthIndex When we split the date string into an array then to support
             * different formats like YYYY-DD-MM we need to track the
             * index of month, day and year i.e here month is at 2 index 
             * where as in MM/DD/YYYY month is at 0 index. Same goes for 
             * dayIndex and yearIndex.
             */
            let regex = /^\d{4}-\d{1,2}-\d{1,2}$/,
                monthIndex = 2,
                dayIndex = 1,
                yearIndex = 0;
            /**
             * In these if else we are updating
             * regex and indexes for month, day and year.
             */
            if (format == "YYYY-MM-DD") {
                monthIndex = 1;
                dayIndex = 2;
            }
            else if (format == "YYYY/DD/MM") {
                regex = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
            }
            else if (format == "MM/DD/YYYY" || format == "DD/MM/YYYY") {
                regex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
                let bool = format == "DD/MM/YYYY";
                /**
                 * If format === "DD/MM/YYYY" means
                 * here day in at 0 index and month is at index 1.
                 * The other possible format inside this else if condition
                 * can be "MM/DD/YYYY" where month is
                 * at 0 index and date at 1 index.
                 * In both conditions year index is at 2.
                 */
                monthIndex = bool ? 1 : 0;
                dayIndex = bool ? 0 : 1;
                yearIndex = 2;
            }
            // First check for the pattern
            if (!regex.test(value))
                return false;
            /**
             * Check that is date is like this 
             * YYYY-DD-MM or YYYY/DD/MM 
             * splited with dashes "-" or slashes "/".
            */
            let splitChar = value.includes('-') ? '-' : '/',
                /**
                 * Split the date string into an array and convert
                 * every string into number
                 */
                date = value.split(splitChar).map(Number),
                /**
                 * Now use our day, month and year
                 * indexes to get the day, month and year respectively 😁.
                 */
                day = date[dayIndex],
                month = date[monthIndex],
                year = date[yearIndex];

            // Check the ranges for possible dates
            if (year < 1000 || year > 3000 || month < 1 || month > 12 || day < 1)
                return false;

            const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

            // Check for leap years.
            if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))
                months[1] = 29;

            // Check the range of the day
            return day <= months[month - 1];
        };
        /**
         * Validate a date time
         * format. 
         * @param {String} value in YYYY-MM-DD HH:MM:SS format
         */
        dateTime(value) {
            return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value);
        }
        //---------------------RULES FOR FILES-----------------------\\
        /**
         * Compare the file size with give max size
         * @param {File} value 
         * @param {number} maxSize Maximum size for files in bytes
         */
        fileSize(value, maxSize, key) {
            maxSize = this.checkNumber(maxSize, 'fileSize')
            if (value instanceof File && value.size > maxSize) {
                /**
                 * Adding error by ourSelf because of some error 
                 * configuration.
                 */
                return this.putError(key, 'fileSize', {
                    fileSize: Validator.getfileSize(maxSize),
                    fileSize2: Validator.getfileSize(value.size)
                });
            }
            return 1;
        }
        /**
         * @param {File} value 
         * @param {Array} mimeTypes containing mimetypes
         */
        fileType(value, mimeTypes) {
            if (this.checkFile(value)) {
                return mimeTypes.includes(value.type);
            }
            return true;
        }
        /**
         * @param {File} value 
         * @param {Array} ext containing mimetypes
         */
        fileExt(value, ext) {
            if (this.checkFile(value)) {
                return ext.includes(value.name.split('.').pop())
            }
            return 1;
        }
        //------------------------RULES FOR IMAGES---------------------------------\\
        /**
         * Compare dimension of images always resolve to 2
         * becuase it automatically adds it error
         * @param {File} value Needs to be an image
         * @param {object} extras should contain this keys
         * @param {array} mimetypes array of mimetypes of images which are allowed if you
         * don't pass it here then it would use Validator.photoMimetypes
         * 
         * The following compariosns of images can be checked but remember
         * pass width and height in px.
         * @param {Number} height of the image you want. At a time you can only
         * pass height and width.
         * @param {Number} width of the image you desire
         * @param {array} equal for equal comparion of width and height
         * you can pass equal as an array where width would be at 0 index and
         * height would be at one index like this [500, 1000]. If you 
         * would pass this then no other parameter would work like smallest
         * and highest.
         * @param {array} smallest for the smallest width and height
         * for image which you are accepting as an image works
         * great with highest param. Array should be like this [90, 120].
         * @param {array} highest for the highest width and height
         * for image which you are accepting as an image.
         * @param {number} square It would check if an image is a perfect
         * square then it would add no error If you want the image
         * to be just square without defining the size of square you
         * can pass it equal to zero 0.
         * @param {number} ratio pass the desired aspect ratio
         * here it would compare the desire aspect ratio for the image
         * like 16/9.
         * @param {number|undefined} difference a number of difference
         * which is allowed b/w expected aspect ratio
         * and user image aspect ratio the lowest value can be 5e-324.
         * The lowest floating point number in js. you can't pass
         * 0 here.
         * @param {string} key name attribute of your input
         * @see getDimensionError 
         */
        dimension(value, extras, key) {
            console.log("extras inside dimension ", extras);
            return new Promise((resolve) => {
                console.log("dimension inside promise start");
                if ((extras?.mimeTypes || Validator.imgMimeTypes).includes(value.type)) {
                    console.log("dimension after image");
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        console.log("insdie filereader ");

                        let image = new Image();
                        image.src = e.target.result;

                        image.onload = () => {
                            let width = image.width,
                                height = image.height;
                            console.log("insdie image");

                            if (extras.hasOwnProperty('height') || extras.hasOwnProperty('width')) {
                                if (extras?.height) {
                                    if (extras.height !== height) {
                                        this.errors[key] = this.getDimensionError(key, 'height', { height })
                                    }
                                }
                                if (extras?.width) {
                                    if (extras.width !== width) {
                                        this.errors[key] = this.getDimensionError(key, 'width', { width })
                                    }
                                }
                            }

                            else if (extras.hasOwnProperty('equal')) {
                                /**
                                 * We want both width and height exactly of the width and
                                 * hight which we want.
                                 */
                                console.log("insdie equal");

                                if (extras.equal[0] !== width || extras.equal[1] !== height) {
                                    this.resolveDimensionErrors(key, 'equal', extras.equal, width, height);
                                    console.log("after equal");
                                }
                            }
                            else if (extras.hasOwnProperty('smallest') || extras.hasOwnProperty('highest')) {
                                if (extras?.smallest) {
                                    /**
                                     * If width and hight of image is less than
                                     * smallest dimension possible return false.
                                     */
                                    console.log("Inside smallest ", width);
                                    if (width < extras.smallest[0] || height < extras.smallest[1]) {
                                        this.resolveDimensionErrors(key, 'smallest', extras.smallest, width, height);
                                        // resolve(true);
                                    }
                                }
                                if (extras?.highest) {
                                    /**
                                    * If width and hight of image is more than
                                    * highest dimension possible add error.
                                    */
                                    if (width > extras.highest[0] || height > extras.highest[1]) {
                                        this.resolveDimensionErrors(key, 'highest', extras.highest, width, height);
                                        // resolve(true);
                                    }
                                }
                            } else if (extras.hasOwnProperty('square')) {
                                if (extras.square === 0) {
                                    /** 
                                     * It means image must be a square but it does
                                     * not need to be of certain size
                                     * like 500px,
                                     */
                                    if (width !== height) {
                                        this.errors[key] = this.getDimensionError(key, 'square', {});
                                    }
                                } else {
                                    if (!(width === extras.square && height === extras.square)) {
                                        this.resolveDimensionErrors(key, 'square_size', [extras.square, extras.square], width, height);
                                    }
                                }
                            } else if (extras.hasOwnProperty('ratio')) {
                                let aspectRatio = width / height;
                                let expectedAspectRatio = extras.ratio;
                                if (typeof expectedAspectRatio === "string") {
                                    let [nom, dom] = expectedAspectRatio.split(":");
                                    expectedAspectRatio = nom / dom;
                                    if (isNaN(expectedAspectRatio)) throw new TypeError(`The string given as aspectRatio ${extras.ratio} is invalid the format of string should be like this 16:9, 4.809889:1.788923 etc.`);
                                }
                                /**
                                 * the less than sign shows that the difference of
                                 * aspectRatio and expectedAspectRatio should not
                                 * be more than 0.1
                                 */
                                if (!(Math.abs(aspectRatio - expectedAspectRatio) < (extras?.difference || 0.1))) {
                                    console.log("aspectratio", expectedAspectRatio, aspectRatio);
                                    this.errors[key] = this.getDimensionError(key, 'aspectRatio', { aspectRatio: extras.ratio })
                                }
                            }
                            resolve(2);
                        }
                    }
                    reader.readAsDataURL(value);
                } else {
                    /**
                    * resolve to 2 because we can't give dimensions error
                    * but image method has already added it's error
                    */
                    resolve(this.image(value, extras?.mimeTypes, key));
                }

            })
        }
        image(value, possibleMimeTypes, key) {
            if (value instanceof File) {
                console.log("image ", value);
                let mimes = Validator.imgMimeTypes;
                if (possibleMimeTypes) mimes = possibleMimeTypes;
                if (!mimes.includes(value.type) && value.type !== 'application/octet-stream') {
                    /**
                     * We need to add error manually and we would return
                     * true because if Mimetypes are not given then extra * would be null.
                     */
                    this.addError(key, 'image', mimes);
                    return 2;
                }
            }
            return 1;
        }

        /**---------THE GREAT REQUIRED RULE WHICH MAKES ALL KINDS OF FIELDS REQUIRED---*/
        /**
         * Make a field required
         * without this rule no other rule 
         * would work on string inputs
         * @param {string|File} value T
         * @param {null} extra 
         * @param {string} key Name attribute for input
         * @returns {1|0} 1 when no error found and 0 when error found.
         */
        required(value, extra, key) {
            if (typeof value !== 'string') {
                let fileInput = SubmitForm.selectElem(`[name="${key}"`, HTMLElement);
                return fileInput?.files?.length > 0 ? 1 : 0;
            }
            return value.trim().length > 0 ? 1 : 0;
        }
        /**
         * Rules verify whether the input match 
         * a specific list element like 
         * i.e you give a list to buy 
         * [laptop, mobile, cpu]
         * Your user needs to give any of 
         * this value.
         * @param {string} value 
         * @param {array} list 
         * @returns {true|false}
         */
        inList(value, list) {
            return list.includes(value);
        }
        /**
         * 
         * @param {string} url 
         * @param {boolean} [allowFtp=null] If you 
         * want to allow ftp urls so then give
         * rule like this {input : "url:1"}
         * and give error message with url_ftp key
         * @returns 
         */
        url(url, allowFtp, key) {
            if (allowFtp) {
                if (!/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(url))
                    return this.putError(key, 'url_ftp');
                return 1;
            }
            return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url);
        }
        zipCode(zipCode) {
            return /^\d{5}(?:-\d{4})?$/.test(zipCode);
        }
        /**
         * Validate a json value
         * @param {string} value 
         * @param {1|true|null} shoudBeObject If rule
         * is passed like this {input : "json:1"} it makes shure that the input
         * must be a valid json object
         * @returns 
         */
        json(value, shoudBeObject = null) {
            try {
                let parsedValue = JSON.parse(value);
                if (shoudBeObject)
                    return typeof parsedValue === 'object' && parsedValue !== null;
                return 1;
            } catch (e) {
                return 0;
            }
        }
        ipv4(ipAddress) {
            return /^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress);
        }
        ipv6(ipAddress) {
            return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$/.test(ipAddress);
        }
        /**
        *@param {string} isbn ISBN Validation (ISBN-10 and ISBN-13)
        */
        isbn(isbn) {
            const isbn10Pattern = /^(?:\d{9}[\dXx]|\d{12})$/;
            const isbn13Pattern = /^(?:\d{13})$/;
            return isbn10Pattern.test(isbn) || isbn13Pattern.test(isbn);
        }
        calculateChecksum(upc) {
            const digits = upc.split('').map(Number);
            const checkDigit = digits.pop();
            const oddSum = digits.filter((_, index) => index % 2 === 0).reduce((sum, digit) => sum + digit, 0);
            const evenSum = digits.filter((_, index) => index % 2 === 1).reduce((sum, digit) => sum + digit, 0);
            // const totalSum = oddSum * 3 + evenSum + checkDigit;
            return { checkDigit, oddSum, evenSum };
        }
        /**
        * @param {string} upc 
        */
        upc(upc) {
            // Remove any non-numeric characters
            upc = upc.replace(/\D/g, '');

            // Check if the UPC is either 12 digits (UPC-A) or 6, 7, or 8 digits (UPC-E)
            if (![6, 7, 8, 12].includes(upc.length)) {
                return false;
            }

            // Checksum calculation for UPC-A
            if (upc.length === 12) {
                let { checkDigit, oddSum, evenSum } = this.calculateChecksum(upc);
                return (oddSum * 3 + evenSum + checkDigit) % 10 === 0;
            }

            // Checksum calculation for UPC-E
            if (upc.length >= 6 && upc.length <= 8) {
                const digits = upc.split('').map(Number);

                // Expand UPC-E to UPC-A format
                if (upc.length === 8) {
                    if (digits[6] === 0 || digits[6] === 1 || digits[6] === 2) {
                        upc = digits.slice(0, 3).concat([0, 0], digits.slice(3, 6)).join('');
                    } else if (digits[6] === 3) {
                        upc = digits.slice(0, 4).concat([0, 0], digits.slice(4, 6)).join('');
                    } else if (digits[6] === 4) {
                        upc = digits.slice(0, 5).concat([0, digits[5]]).join('');
                    } else {
                        upc = digits.slice(0, 6).concat([digits[6]]).join('');
                    }
                }

                // Validate UPC-A format
                return this.upc(upc);
            }

            return false;
        }

        /**
        *@param {number} ean European article number
        */
        ean(ean) {
            // Remove any non-numeric characters
            ean = ean.replace(/\D/g, '');

            // Check if the EAN is either 8 digits (EAN-8) or 13 digits (EAN-13)
            if (![8, 13].includes(ean.length)) {
                return false;
            }

            // Calculate checksum for EAN-8
            if (ean.length === 8) {
                let { checkDigit, oddSum, evenSum } = this.calculateChecksum(ean);
                const totalSum = oddSum * 3 + evenSum;

                return (10 - (totalSum % 10)) % 10 === checkDigit;
            }

            // Calculate checksum for EAN-13
            if (ean.length === 13) {
                let { checkDigit, oddSum, evenSum } = this.calculateChecksum(ean);
                const totalSum = evenSum * 3 + oddSum;
                return (10 - (totalSum % 10)) % 10 === checkDigit;
            }

            return false;
        }

        /**
         * This rule takes any regex and 
         * validate input on the basics of it.
         * Input must match with given regex.
         * @param {string} value 
         * @param {RegExp} regex 
         */
        regex(value, regex) {
            return regex.test(value);
        }
        /**
         * The field under validtaion should not match with
         * the given regex.
         * @param {string} value 
         * @param {RegExp} regex 
         */
        notRegex(value, regex) {
            return !regex.test(value);
        }
    }
})();

var [Validator, SubmitForm] = (function () {
    'use strict';
    class Validator {
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
            /**
             * Conditional errors
             */
            this.conerrors = {};
            this.conShowErrors = {};
        }
        /**
         * Register a New Conditional Errors object with the given inputName and ruleName
         * @param {string} inputName 
         * @param {string} ruleName 
         * You can access your conditional error object like this 
         * @code this.conerrors[inputName][ruleName] 
         * it is an object 
         * which contain condional errors for inputs
         */
        regConErrors(inputName, ruleName) {
            if (typeof this.conerrors?.[inputName]?.[ruleName] == 'undefined') {
                if (typeof this.conerrors?.[inputName] == 'undefined') {
                    this.conerrors[inputName] = {};
                }
                this.conerrors[inputName][ruleName] = {};
            }
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

        static get RULE_EMAIL() {
            return 'email';
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
            // If object doesn't contain rule property it means the whole object is rule
            let rules = obj?.rules || obj;
            // if (!obj.hasOwnProperty('rules')) {
            //     rules = obj;
            // } else {
            //     rules = obj.rules;
            // }
            let verify = new Validator(rules, (obj?.errorMsgs || {})),
            callback = obj?.callback || verify.showErrors.bind(verify),
            condionalCallback = obj?.condionalCallback || callback,
            conThrottle = obj?.conThrottle || 500,
            throttle = obj?.throttle || 300;
            // if (!callback) {
            //     callback = verify.showErrors.bind(verify);
            // }
            if (typeof callback !== 'function') throw new TypeError("callback paratemer needs to be a function");

            // window.errors = verify.errors;

            for (const key in verify.rules) {

                if (verify.rules.hasOwnProperty(key)) {
                    let input = $(`[name="${key}"]`),
                        rule = verify.resolveRule(verify.rules[key]),
                        bool = rule.includes('required'),
                        // throttledCallback = verify.throttle(verify.runConrules, delay, options)
                        i = verify.runConrules(key, rule, conThrottle);
                        if(i > -1){
                            // Means an input can't have more than one conditional rules
                            continue;
                        }
                    //     i = rule.findIndex(v => {
                    //         if (typeof v === 'object') {
                    //             if (v.hasOwnProperty('any_of')) {
                    //                 return true;
                    //             }
                    //         }
                    //         return false;
                    //     })
                    // console.log(i);
                    // if (i > -1) {
                    //     verify.regConErrors()
                    //     verify.conerrors['any_of'] = {};
                    //     for (const skey in rule[i]['any_of']) {
                    //         window.r = rule[i];
                    //         if (rule[i]['any_of'].hasOwnProperty(skey)) {
                    //             let e = $(`[name="${skey}"]`);
                    //             console.log(e, skey, rule[i]['any_of']);
                    //             e.on('input', async function () {
                    //                 for (const nK in rule[i]['any_of']) {
                    //                     if (rule[i]['any_of'].hasOwnProperty(nK)) {
                    //                         let s = await verify.verify(verify.getDataFromInput(nK, true), nK, verify.resolveRule(rule[i]['any_of'][nK]), 'any_of');
                    //                         if (s === 2) {
                    //                             /**
                    //                              * Verifier did not found any error 
                    //                              * inside this field.
                    //                             */
                    //                             console.log(nK, s, "clearing error");
                    //                             verify.conerrors['any_of'] = {};
                    //                             for (const k in rule[i]['any_of']) {
                    //                                 console.log("Inside clearing error", k);
                    //                                 if (verify.errors.hasOwnProperty(k)) {
                    //                                     delete verify.errors[k];
                    //                                 }

                    //                             }
                    //                             break;
                    //                         }
                    //                     }
                    //                 }
                    //                 if (Object.keys(verify.conerrors['any_of']).length > 0) {
                    //                     console.log("when error is found.", skey, verify.conerrors['any_of'][skey]);
                    //                     verify.errors[skey] = verify.conerrors['any_of'][skey];
                    //                 }
                    //                 // callback(null, verify.errors, verify.rules, verify);    
                    //                 verify.showConErr(rule[i]['any_of']);
                    //             });
                    //         }
                    //     }
                    //     continue;
                    // }


                    if (bool) {
                        input.on('blur focus', function () {
                            /**
                              * On file case making val null because
                              * required function would select file by 
                              * itself.
                              */
                            let val = (input[0].type === 'file') ? null : input.val();
                            if (verify.required(val, null, key) == 0) {
                                verify.putError(key, 'required');
                                callback(key, verify.rules, verify.errors, this);
                            };
                        });
                    }
                    input.on('input', verify.throttle(async function () {
                        // verify.getDataFromInput(key)
                        let i = await verify.verify(verify.getDataFromInp(input[0]), key, rule);
                        if (i === 2) {
                            /**
                             * Verifier did not found any error 
                             * inside this field.
                            */
                            if (verify.errors.hasOwnProperty(key)) {
                                delete verify.errors[key];
                            }
                        }
                        callback(key, verify.rules, verify.errors,  verify);
                    }, throttle));
                }
            }
        }
        /**
         * Get the conditional rule and it's index inside an arrau
         * @param {Array} rule 
         * @returns 
         */
        getConrule(rule){
            let allConRules = ['any_of'];
            // Checking the rule array for any conditional rules
            for (let i = 0; i < rule.length; i++) {
                const e = rule[i];
                if (typeof e === 'object') {
                    console.log('object', e);
                    for (const v of allConRules) {
                        console.log('value', v);
              
                        if (e.hasOwnProperty(v)) {
                            return [i, v];
                        }
                    }
                }
            }
            return [-1];
        }
        /**
        * Run a function with the given time 
        * @param {Function} callBack 
        * @param {Number} delay 
        * @param {object} options
        * @param {...} args callBack parameters
        * @returns {Function} Returns an async function
        */
        throttle(callBack, delay, ...args){
            let lastTimeExe = 0, now;
            return async function(){
                console.log("Throttle is invoked");
                now = Date.now();
                // timeSinceLastExe = now - lastTimeExe;
                // clearTimeout(timeOut);
                // timeOut = setTimeout(async ()=> {
                //     lastTimeExe = now;
                //     console.log("Set time is invoked", delay, now, timeSinceLastExe, lastTimeExe, timeOut)
                //    await callBack.apply(this, args)
                // }, delay);
                if(now - lastTimeExe >= delay){
                    console.log("Throttle run the function");
                    lastTimeExe = now;
                    await callBack.apply(context, args);
                }
            };
        }
        /**
         * 
         * @param {string} key 
         * @param {Array} rule 
         * @param {Number} throttlingTime 
         */
        runConrules(key, rule, throttlingTime) {
            let [i, r] = this.getConrule(rule);

            console.log("Inside conrules", i, r, key)
            if(i > -1){

                this.regConErrors(key,r);

                let ruleObj = {inp : key, ruleName : r};

                for (const skey in rule[i][r]) {

                    if (rule[i][r].hasOwnProperty(skey)) {

                        let e = $(`[name="${skey}"]`);

                        console.log(e, skey, rule[i][r]);
                        e.on('input', this.throttle(async function(){

                            for (const nK in rule[i][r]) {

                                if (rule[i][r].hasOwnProperty(nK)) {

                                    let s = await this.verify(this.getDataByKey(nK, true), nK, this.resolveRule(rule[i][r][nK]), ruleObj);
                                    if (s === 2) {
                                        /**
                                         * Verifier did not found any error 
                                         * inside this field.
                                        */
                                        console.log(nK, s, "clearing error");
                                        this.conerrors[key][r] = {};
                                        for (const k in rule[i][r]) {
                                            console.log("Inside clearing error", k);

                                            if (this.errors.hasOwnProperty(k)) {
                                                delete this.errors[k];
                                            }

                                        }
                                        break;
                                    }
                                }
                            }
                            if (Object.keys(this.conerrors[key][r]).length > 0) {
                                console.log("when error is found.", skey, this.conerrors[key][r][skey]);
                                this.errors[skey] = this.conerrors[key][r][skey];
                            }
                            // callback(null, verify.errors, verify.rules, verify);    
                            this.showErrors(null, rule[i][r]);
                        }, throttlingTime));
                    }
                
            }
            return i;
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
                dateAll: 'Please enter a valid date',
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
                upca: "Please enter a valid UPC-A (Universal Product Code).",
                ean13: "Please enter a valid EAN-13 (European Article Number)."
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
        resolveDimensionErrors(key, errorSubName, array, width, height, addError) {
            this.addErrorConditionally(this.getDimensionError(key, errorSubName, { givenWidth: width, givenHeight: height, expectedWidth: array[0], expectedHeight: array[1] }), addError)
            // this.errors[key] = this.getDimensionError(key, errorSubName, { givenWidth: width, givenHeight: height, expectedWidth: array[0], expectedHeight: array[1] });
        }
        /**
         * Return error as an string 
         * @param {string} k Input attribute 
         * @param {string} r Name of rule
         * @param {string|null|object} e  
         * @returns  {string}
         */
        rE(attribute, ruleName, extras) {
            let message = this.getError(attribute, ruleName);
            if (extras) {
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
            return message;
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

            this.errors[attribute] = this.rE(attribute, ruleName, extras);
        }
        /**
         * Add errors in errors object with replacements
         * @see strReplace
         * @returns {2}
         */
        putError(key, ruleName, replaceMents = null, addError = true, curlyBraces = true) {
            let msg;
            if (!replaceMents) msg = this.getError(key, ruleName);
            else msg = Validator.strReplace(this.getError(key, ruleName), replaceMents, curlyBraces);
            return this.addErrorConditionally(key, msg, addError);
        }

        /**
         * Handles adding error conditionally for conditional rules like any_of etc
         * @param {string} key Input name attribute
         * @param {string} errorMsg 
         * @param {object|true} addError 
         * @returns 
         */
        addErrorConditionally(key, errorMsg, addError) {
            console.log("Inside add error", key, errorMsg, addError);
            if (addError === true) {
                this.errors[key] = errorMsg;
            } else {
                window.conerrors = this.conerrors;
                this.conerrors[addError.inp][addError.ruleName][key] = errorMsg;
            }
            return 2;
        }
        /**
         * Gets all errors from error object
         * @returns {object}
         */
        getErrors() {
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

                /**
                 * This field is not valid because errors object 
                 * contains it keys.
                 */
                this.addOrRemoveClass(key, this.errors[key], true);
            }
            // if (this.rules.hasOwnProperty(key)) 
            else {
                /**
                 * It means it is a valid field
                 */
                this.addOrRemoveClass(key);
            }
        }
        showErrors(key = null, rules) {
            if (key) this.baseShowErrors(key);
            else {
                for (const key in rules) {
                    this.baseShowErrors(key);
                }
            }
        }

        showConErr(rule) {
            for (const key in rule) {
                if (rule.hasOwnProperty(key)) {
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
                for (const key in verify.rules) {
                    value = verify.data.getAll(key);
                    let outPut = await verify.verify(value, key, verify.resolveRule(verify.rules[key]));
                    if (outPut) continue; //This input either has error or undefined rules so move on to next input
                }
            }
            else if (typeof verify.data === 'object') {
                for (const key in verify.rules) {
                    value = verify.data[key];

                    await verify.verify(value, key, verify.resolveRule(verify.rules[key]));
                    // if (outPut) continue;
                    // else break; 
                }
            }
            let bool = verify.isFailed();
            if (!bool) {
                if (typeof callback === 'undefined') {
                    verify.showErrors(null, verify.rules);
                } else if (typeof callback === 'function') {
                    callback(verify.rules, verify.errors, verify);
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
         * @param {boolean|string} [addError=true] For conditional rules
         * @returns {Promise<2|1>} 1 when error is found and 2 when no 
         * error was found
         * @returns {}
        */
        async verify(value, key, rule, addError = true) {
            console.log("Verify ",rule);
            if (Object.keys(value).length === 0 || typeof value === 'undefined') {
                //This is special conditions for checkbox
                if (rule.includes('accept')) {
                    return this.accept(null, null, key, addError);
                }
            }

            // return this.runRules(rule, value, key);
            for (const r of rule) {
                let [ruleName, extra] = this.resolveSubRule(r);
                if (typeof this[ruleName] === 'function') {
                    if (typeof value === 'string') {
                        let i = await this.baseVerifier(ruleName, key, extra, value, addError);
                        if (i === 1) return 1;
                        else if (i === 2) continue;
                    } else {
                        for (let v of value) {
                            /**
                             * Appliying rule one by one on an input.
                             */
                            let i = await this.baseVerifier(ruleName, key, extra, v, addError);
                            if (i === 1) return 1;//error is added so move on next field
                            else if (i === 2) continue;//Means no error found

                        }
                    }
                } else {
                    throw new Error("There is no rule defined with name " + ruleName + ".");
                }
            }
            return 2;
        }
        async runRules(rule, value, key) {
            for (const r of rule) {
                let [ruleName, extra] = this.resolveSubRule(r);
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
                } else {
                    throw new Error("There is no rule defined with name " + ruleName + ".");
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

        async baseVerifier(ruleName, key, extra, v, addError = true) {
            /**
             * Appliying rule one by one on an input.
             */
            console.log("Base", ruleName, v);
            if (ruleName != 'required' && ruleName != 'any_of' && typeof v == 'string' && v.trim().length == 0) return 2;
            let bool = await this[ruleName](v, extra, key, addError);
            switch (bool) {
                case false:
                case 0:
                    /**
                    * It means this field has error;
                    */
                    this.addErrorConditionally(key, this.rE(key, ruleName, extra), addError)
                    // if (addError===true) {
                    //     this.addError(key, ruleName, extra);
                    // } else {
                    //     console.log("key", key);
                    //     this.conerrors[addError][key] = this.rE(key, ruleName, extra);
                    // }
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
         * @param {string|Array|object} rule User given rule
         * @returns {Array}
         * @throws {TypeError}
         */
        resolveRule(rule) {

            if (typeof rule == 'string') {
                return rule.split('|');
            } else if (Array.isArray(rule)) {
                return rule;
            } else if (typeof rule == 'object') {
                return [rule];
            } else {
                throw new TypeError(`You need to pass rules as an array or a string. You can only pass a single rule inside an object. ${typeof rule} is not allowed as a rule.`);
            }
        }
        /**
         * Resolve sub rules
         * @param {string|object} r Rule to be converted
         * @returns {Array}
         */
        resolveSubRule(r) {
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
            } else {
                throw new TypeError("Inside a rule you can't give another rule as an" + typeof r + " . You can only give a subrule as a string or object.");
            }
            return [ruleName, extra];
        }
        /**
         * Returns the data specific for rule by data object or input value or files
         * @param {string} key 
         * @param {boolean} [all=false]  In case of array of fileList it just
         * returns element at 0 index if you want to get the complete array
         * and filelist make it true
         * @returns {Array|FileList|string}
         */
        getDataFromInp(e, all){
            if (e.type === 'file') {
                if (all) return e.files;
                return e.files?.[0];
            }
            return e.value
        }
        getDataByKey(key, all = false) {
            let e = SubmitForm.selectElem(`[name="${key}"]`, HTMLElement);
            return this.getDataFromInp(e,all);
        }
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

            return this.getDataByKey(key, all);

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
        accept(v, e, key, addError) {
            let elem = SubmitForm.selectElem(`[name='${key}']`, HTMLInputElement, true);
            if (!elem.prop('checked')) {
                return this.addErrorConditionally(key, this.rE(key, 'accept', e), addError);
            }
            return 1;
        }
        /**
         * If any of the field needs to fulfill the given the rules
         * like a field a and b both have their own rule and we want
         * to apply only one of them at a time.
         * @param {string|File} value 
         * @param {object} obj 
         * @param {string} key 
         * obj = {input1:"p",input2 : "rule2"}
         */
        async any_of(value, obj, k) {
            this.regConErrors(k, 'any_of');
            let addError = { inp: k, ruleName: 'any_of' };
            console.log("Inside any_of", value, obj, k);
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    //Check all rules on an input one by one here obj[key] is rules
                    //Means there is a field which has no errors 
                    if (await this.verify(this.getData(key, true), key, this.resolveRule(obj[key]), addError) == 2) return 1;
                }
            }
            console.log("After validate", value, obj, k);
            console.log(this.conerrors);
            this.errors[k] = this.getUserError(k, 'any_of') || this.conerrors[k]['any_of'][k];
            return 2;
        }
        async any_of_rules(value, array, k){

            window.errors = this.errors;

            this.regConErrors(k, 'any_of_rules');

            let s, obj = {inp : k, ruleName : 'any_of_rules'};

            for (let i = 0; i < array.length; i++) {
                s = await this.verify(value, k, this.resolveRule(array[i]), obj);
                console.log("Inside any of rules",s);
                if(s === 2){
                    // It means no errors
                    break;
                }
            }
            // console.log(this.conerrors[k]['any_of_rules']);
            if(s == 1){
                this.errors[k] = this.getUserError(k, 'any_of_rules') || this.conerrors[k]['any_of_rules'][k];
            }
            return s > 1 ? 1 : 2;
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
        detectMultipleSpaces(value, extra, key, addError) {
            let bool = value.replace(/\s+/g, ' ') === value;
            if (!bool) {
                return this.putError(key, ruleName, addError);
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
        space(value, detectMultiple, key, addError) {
            let regex = /\s+/g,
                bool = regex.test(value);
            if (bool && detectMultiple) {
                return this.detectMultipleSpaces(value, null, key, addError);
            }
            return bool;
        }
        password(value, extra, key, addError) {
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
                let errorMsg = this.getUserError(key, errorName) || this.getUserError(key, 'password') || Validator.strReplace(this.errorMessages[errorName], { ['{min}']: (extra || 8), field: 'password' }, false);
                return this.addErrorConditionally(key, errorMsg, addError);
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
        numb_space(value, strict, key, addError) {
            value = value.trim();
            // if (value.length === 0) return true;
            let bool = /^[0-9 ]+$/.test(value);
            if (bool && strict) {
                this.detectMultipleSpaces(value, null, key, addError);
            }
            return bool;
        }
        range(value, range, key, addError) {
            if (value.trim().length > 0 && (value < range[0] || value > range[1])) {
                return this.putError(key, 'range', { num1: range[0], num2: range[1] }, addError);
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
        dateTime(value, format) {
            let val = value.split(" ");
            let bool;
            if (!format) {
                bool = this.dateAll(val?.[0]);
            } else {
                bool = this.date(val?.[0], format);
            }
            if (bool) {
                let a = val?.[1]?.split(':')?.map(Number);
                if (a?.length !== 3 || a[0] > 23 || a[0] < 0 || a[1] > 59 || a[1] < 0 || a[2] > 59 || a[2] < 0) {
                    return false;
                }
                return /^\d{1,2}:\d{1,2}:\d{1,2}$/.test(val?.[1]);
            }
            return bool;
        }
        //---------------------RULES FOR FILES-----------------------\\
        /**
         * Compare the file size with give max size
         * @param {File} value 
         * @param {number} maxSize Maximum size for files in bytes
         */
        fileSize(value, maxSize, key, addError) {
            maxSize = this.checkNumber(maxSize, 'fileSize')
            if (value instanceof File && value.size > maxSize) {
                /**
                 * Adding error by ourSelf because of some error 
                 * configuration.
                 */
                return this.putError(key, 'fileSize', {
                    fileSize: Validator.getfileSize(maxSize),
                    fileSize2: Validator.getfileSize(value.size)
                }, addError);
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
        dimension(value, extras, key, addError) {
            return new Promise((resolve) => {
                if ((extras?.mimeTypes || Validator.imgMimeTypes).includes(value.type)) {
                    const reader = new FileReader();
                    reader.onload = (e) => {

                        let image = new Image();
                        image.src = e.target.result;

                        image.onload = () => {
                            let width = image.width,
                                height = image.height;

                            if (extras.hasOwnProperty('height') || extras.hasOwnProperty('width')) {
                                if (extras?.height) {
                                    if (extras.height !== height) {
                                        this.addErrorConditionally(key, this.getDimensionError(key, 'height', { height }), addError);
                                        // this.errors[key] = this.getDimensionError(key, 'height', { height })
                                    }
                                }
                                if (extras?.width) {
                                    if (extras.width !== width) {
                                        this.addErrorConditionally(key, this.getDimensionError(key, 'width', { width }), addError);
                                        // this.errors[key] = this.getDimensionError(key, 'width', { width })
                                    }
                                }
                            }

                            else if (extras.hasOwnProperty('equal')) {
                                /**
                                 * We want both width and height exactly of the width and
                                 * hight which we want.
                                 */

                                if (extras.equal[0] !== width || extras.equal[1] !== height) {
                                    this.resolveDimensionErrors(key, 'equal', extras.equal, width, height, addError);
                                }
                            }
                            else if (extras.hasOwnProperty('smallest') || extras.hasOwnProperty('highest')) {
                                if (extras?.smallest) {
                                    /**
                                     * If width and hight of image is less than
                                     * smallest dimension possible return false.
                                     */
                                    if (width < extras.smallest[0] || height < extras.smallest[1]) {
                                        this.resolveDimensionErrors(key, 'smallest', extras.smallest, width, height, addError);
                                        // resolve(true);
                                    }
                                }
                                if (extras?.highest) {
                                    /**
                                    * If width and hight of image is more than
                                    * highest dimension possible add error.
                                    */
                                    if (width > extras.highest[0] || height > extras.highest[1]) {
                                        this.resolveDimensionErrors(key, 'highest', extras.highest, width, height, addError);
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
                                        this.addErrorConditionally(key, this.getDimensionError(key, 'square', {}), addError)
                                        // this.errors[key] = this.getDimensionError(key, 'square', {});
                                    }
                                } else {
                                    if (!(width === extras.square && height === extras.square)) {
                                        this.resolveDimensionErrors(key, 'square_size', [extras.square, extras.square], width, height, addError);
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
                                    this.addErrorConditionally(key, this.getDimensionError(key, 'aspectRatio', { aspectRatio: extras.ratio }), addError);
                                    // this.errors[key] = this.getDimensionError(key, 'aspectRatio', { aspectRatio: extras.ratio })
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
        image(value, possibleMimeTypes, key, addError) {
            if (value instanceof File) {
                let mimes = Validator.imgMimeTypes;
                if (possibleMimeTypes) mimes = possibleMimeTypes;
                if (!mimes.includes(value.type) && value.type !== 'application/octet-stream') {
                    /**
                     * We need to add error manually and we would return
                     * true because if Mimetypes are not given then extra * would be null.
                     */
                    return this.addErrorConditionally(key, this.rE(key, 'image', mimes), addError);
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
        url(url, allowFtp, key, addError) {
            if (allowFtp) {
                if (!/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(url))
                    return this.putError(key, 'url_ftp', addError);
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
            const oddSum = digits.filter(
                (_, index) => index % 2 === 0).reduce(
                    (sum, digit) => sum + digit, 0);
            const evenSum = digits.filter((_, index) => index % 2 === 1).reduce((sum, digit) => sum + digit, 0);
            return { checkDigit, oddSum, evenSum };
        }

        /**
        * @param {string} upc  
        */
        upca(upc) {
            // Remove any non-numeric characters
            upc = upc.replace(/\D/g, '');
            // Checksum calculation for UPC-A
            if (upc.length === 12) {
                let { checkDigit, oddSum, evenSum } = this.calculateChecksum(upc);
                return (oddSum * 3 + evenSum + checkDigit) % 10 === 0;
            }
            return false;
        }

        /**
        *@param {number} ean European article number 13
        */
        ean13(ean) {
            // Remove any non-numeric characters
            ean = ean.replace(/\D/g, '');
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

    class SubmitForm {
        /**
         * 
         * @param {File} blob 
         * @param {Number} [chunkSize=1] In Mbs
         * @returns {Promise} On resolve case get an object contain
         *  these keys 
         * {
         *      name: file name, 
         *      base64: base64 string,
         *      type: file type, 
         *      lastModified : file last modified time in ms,
         *      size : filesize
         * }
         */
        static readBlobAsBase64(blob, chunkSize = 1) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                chunkSize = chunkSize * 1024 * 1024;//in Mbs
                let offset = 0;
                const base64Chunks = [];

                reader.onload = function (event) {
                    if (base64Chunks.length === 0)
                        base64Chunks.push(event.target.result);
                    else
                        base64Chunks.push(event.target.result.split(',')[1]);
                    if (offset < blob.size) {
                        readNextChunk();
                    } else {
                        const completeBase64 = base64Chunks.join('');
                        resolve({
                            "name": blob.name,
                            "filesize": blob.size,
                            "type": blob.type,
                            "lastModified": blob.lastModified,
                            "base64": completeBase64,
                            "base64size": SubmitForm.base64size(completeBase64),

                        });
                    }
                };

                reader.onerror = function () {
                    reject(reader.error);
                };

                function readNextChunk() {
                    const chunk = blob.slice(offset, offset + chunkSize);
                    reader.readAsDataURL(chunk);
                    offset += chunk.size;
                }

                readNextChunk();
            });
        }
        /**
         * Calculate the size of bytes
         * @param {string} base64 Base64 decoded string
         * @returns {Number} size in bytes
         */
        static base64size(base64) {
            // Remove data URI scheme if present
            const cleanedBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
            const length = cleanedBase64.length;
            const sizeInBytes = (length * 3) / 4;
            let paddingCount = 0;
            while (cleanedBase64[length - paddingCount - 1] === '=') {
                paddingCount++;
            }
            return sizeInBytes - (paddingCount * 3) / 4;

        }
        /**
         * 
         * @param {Array<object>} data 
         * @param {Array<object>|null} inputs  array containing name value objects
         * @returns {Array<object>}
         */
        // static checkFormInputs(data, inputs) {
        //     if (inputs !== null) {
        //         /**
        //         * If we want to edit or add certain values 
        //         */
        //         inputs.forEach(obj => {
        //             let indexToChange = data.findIndex(field => field.name === obj.name);
        //             if (indexToChange > -1) {
        //                 data[indexToChange].value = obj.value
        //             } else {
        //                 data.push(obj);
        //             }
        //         });
        //     }
        //     return data;
        // }
        static #checkFormObjInputs(data, obj) {
            if (obj.inputs !== null) {
                /**
                 * It means in this Formdata obj we need to add
                 * these data 
                 * Which can contain files , FILELIST, array, string, blob 
                 * Obj.inputs need to be an object in this case
                 * Containing files like this 
                 * {
                 * "profile" : FILE 
                 * "Dp" : FILELIST|Array of files
                 * }
                 * In case of multiple files name needs to be like this name[]
                 */

                if (Array.isArray(obj.inputs)) {
                    /**
                     * It means an array conatining objects like this 
                     * [
                     *      {
                     *          "profile" : FILE 
                     *          "Dp" : "My db"
                     *      },
                     *      {
                     *          "profile2" : FILE 
                     *          "Dp" : FILELIST|Array of files
                     *      },
                     * ]
                     */
                    for (const input of obj.inputs) {
                        data = SubmitForm.#addInput(data, input, obj.overwrite);
                    }
                } else if (typeof obj.inputs === 'object') {
                    data = SubmitForm.#addInput(data, obj.inputs, obj.overwrite);
                } else {
                    throw new TypeError("Object, FormData and arrays are only allowed " + typeof obj.inputs + "  is not allowed.");
                }
            }
            return data;
        };

        static #addInput(data, inputObject, overwrite) {
            if (inputObject instanceof FormData) {
                /**
                 * Creating set so dublicate keys won't come again and again
                 */
                for (const key of new Set(inputObject.keys())) {
                    let all = inputObject.getAll(key);
                    data = SubmitForm.#insideLoop(data, key, all, overwrite)
                }
            } else {
                for (const key of Object.keys(inputObject)) {
                    data = SubmitForm.#insideLoop(data, key, inputObject[key], overwrite);
                }
            }
            return data;
        }
        /**
         * For sake of dry principle created this function
         * @param {FormData|object} data 
         * @param {string} key 
         * @param {string|object|Iterable|FileList} value 
         * @param {string} overwrite 
         * @returns 
         */
        static #insideLoop(data, key, value, overwrite) {
            let bool = !(overwrite === 'overwritenone' || overwrite === 'overwritefiles');
            data = SubmitForm.overWritedata(data, key, overwrite);
            if (typeof value === 'object' || Array.isArray(value) || value instanceof FileList) {
                // In case of fileList or array or multple inputs maybe text inputs with same name
                for (const input of value) {
                    if (
                        data.has(key)
                        && !(data.get(key) instanceof File)//I think that data.get(key) can be replaced with value
                        && bool
                    ) {
                        /**
                         * Means that in case of text inputs we are overwriting text inputs
                         * if overwrite option is not 'overwritenone' or not 'overwritefiles'
                         * That's they for text inputs we only get to keep one input no array.
                         */
                        data.delete(key);
                    }
                    data.append(key, input);
                }
            } else {
                //It can be a single file or a normal input
                data.append(key, value);
            }
            return data;
        }
        /**
         * @param {HTMLFormElement | string} selector Resolve a selector or throws error
         * @param {{ new (): HTMLFormElement; prototype: HTMLFormElement}}[instance=HTMLFormElement] Type of element you want to select like HTMLElement, 
         * HTMLInputElement etc if your element doesn't match with this slector
         * @param {boolean} [withJquery = false] want to select the element with jquery
         * @returns {HTMLElement} 
         * @throws TypeError
         */

        static selectElem(selector, instance = HTMLFormElement, withJquery = false) {
            let elem = null;
            if (selector instanceof instance) elem = selector;
            else if (typeof selector === 'string') elem = withJquery ? $(selector) : document.querySelector(selector);

            else if (selector?.[0] instanceof instance) elem = withJquery ? selector : selector[0];//It is a jquery object
            if (!(elem instanceof instance || elem?.[0] instanceof instance)) throw new TypeError(`No element in dom exists with this ${selector} selector.`);
            return elem;
        }
        /**
         * Returns node list of input[type='file'] inside given form
         * @param {string|HTMLFormElement} form
         * @returns {NodeList} 
         */
        static fileInputs(form) {
            let selector = SubmitForm.selectElem(form);
            return selector.querySelectorAll('input[type="file"]');
        }
        /**
         * Select the files from a form
         * @param {HTMLFormElement | string} form Needs to be a form selector.
         * @param {boolean} [fileTobase64=false] If you want to get the files as base64 string
         * @returns {object}
         */

        static async selectFiles(form, fileTobase64 = false) {
            let dataObj = {};
            let fileInputs = SubmitForm.fileInputs(form);
            if (fileInputs.length > 0) {
                for (const input of fileInputs) {
                    if (input.files.length > 0) {
                        let name = input.getAttribute('name');

                        try {
                            /**
                             * Assigning complete FILELIST to the elements
                             */
                            dataObj[name] = input.files;
                            if (fileTobase64) {
                                let array = [];
                                for (const name in dataObj) {
                                    for (const file in dataObj[name]) {
                                        array.push(await SubmitForm.readBlobAsBase64(file));
                                    }
                                    dataObj[name] = array;
                                }
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            }
            return dataObj;
        }

        static quickSumbit(obj) {
            let form = SubmitForm.selectElem(obj.form);
            form.onsubmit = async e => {
                e.preventDefault();
                await SubmitForm.justSubmit(obj);
            }

        }
        // static submitMultiple(obj){
        //     if(Array.isArray(obj.form)){
        //         for (const form of obj.form) {
        //             form.onsubmit = async e => {
        //                 let
        //             };
        //         }
        //     }
        // }
        static overWritedata(data, key, overwrite) {
            if (overwrite !== "overwritenone") {
                if (overwrite === "overwriteall" && data.has(key)) data.delete(key);
                else if (overwrite === "overwritefiles" && data.has(key)) {
                    // It means only overwrite files
                    if (data.get(key) instanceof File)
                        data.delete(key);
                } else if (overwrite === "overwritebutnotfiles" && data.has(key)) {
                    if (!(data.get(key) instanceof File))
                        data.delete(key);
                }
            }
            return data;
        }
        /**
         * Elegantly submits form with your flexibality
         * @param {object} obj an object containing all this properties
         * 
         * @property {object | FormData | string | HTMLFormElement} [obj.form]*  In case of 
         *  string It needs to be form Selector. It can be instance of HTMLFormElement too.
         *  It can ba a normal object too as well as it can be a FormData object too.
         * 
         * @property {object} [obj.ajaxSettings]*  Containg ajax configurations 
         * like success, onerror, 
         * beforeSend, data, dataType, type, url if your type is post then you don't need to 
         * enter it post is set in this function by default.
         * 
         * 
         * @property {string} [obj.overwrite] (optional) Possible values for this parameter
         * is:
         * 1) overwriteAll: (It is default)
         * 
         * For overwriteAll any dublicate name keys or obejct keys which you have given will 
         * be overwritten and this way only last value would be contain by this name keys/
         * For example:
         * Your form contain inputs with name {"input1" : "value1"} and in your input object
         * you also give this key like this obj.inputs = {"input1" : "value2"} notice that in
         * both objects name keys are same so it would only consider "input1" = "value2" which
         * has overwritten your form value.
         * 
         * 2) overwriteNone: 
         * 
         * If you don't want to overwrite this values you can use "overwriteNone"
         * which stops overwriting all things, for this case 
         * you would get an array on server like this input1 =>[ 0 => "value1", 1 => "value2"].
         * 
         * 3) overwriteFiles:
         * 
         * The "overwriteFiles" explicitly only overwrite files doesn't overwrite
         * text or other inputs.
         * 
         * 4) overwriteButNotFiles:
         * 
         * "overwriteButNotFiles" only overwrites text data doesn't overwrite
         * files.
         * 
         *
         * @property {Array} [obj.resetKeys] (optional) If you want to delete some inputs pass
         * their name inside in an array i.e ['input1', 'input2'];
         *  
         * 
         * @property {Array|object|FormData} [obj.inputs] (optional)
         * In case of object It can be a normal object or a Formdate object 
         * which will be appended with the existing data. If duplicate data 
         * would be found inside your object it would be overwritten based
         * on the overwrite parameter.
         * In case of array it can contain multiple objects and Formdata object.
         * As a value for these objects you can use, form inputs value
         * (string|number|FILE|FILELIST), FILELIST, Array (string|File), strings, Number.
         * 
         * 
         * @property {object} [obj.validate] (optional) The object For validtaion
         * of your form. You can either pass Valdiator instance or
         * just pass rules.
         * 
         * Note: When you pass dataType: "JSON" all data would be
         * converted into a valid json. If your form contain files
         * all files would be converted into base64 and if a single input
         * holds multiple files then an array of base64 files would be assign to
         * that input. Never use base64 for files bigger than 20mb because it
         * takes too much time and a lot of space in user browser.
         * 
         * @property {string|object} [obj.responseElem] (optional) If you didn't 
         * pass on success function
         * inside the ajaxSettings and quickly want to show the response you can use 
         * responseElem which can handle showing response.
         * In case of string this it needs to be selector for an html element. This
         * function would select that element where you want to show the 
         * response and put all data from server on there.
         * 
         * In case of an object it should contain two keys 
         * {
         *      elem: ".show-html-element-class",
         *      key : "This should be the key of the json which is coming from the server like
         * if server is sendion json data and it has a key response you can pass response here it
         * will show the data. of the respose key of the json not all json data."
         * }
         * 
         * @returns {Promise}
         */

        static async justSubmit(obj) {
            obj = {
                overwrite: "overwriteAll", //overwrite all is by default
                inputs: null,
                ...obj
            };
            // For developer ease
            obj.overwrite = obj.overwrite.toLowerCase();

            let ajaxSettings = {
                type: "POST",
                ...obj.ajaxSettings
            }

            let inJson = ajaxSettings?.dataType?.toLowerCase() === 'json';
            let data;

            /**
             * Start form handling
             */
            if (obj.form instanceof HTMLFormElement || typeof obj.form === 'string') {
                /**
                 * This is because in case of files selection we might 
                 * gonna need this
                 */
                let form = SubmitForm.selectElem(obj.form);
                data = new FormData(form);
            } else if (typeof obj.form === 'object') {
                /**
                 * For both normal object and form data object
                 */
                data = obj.form;
            }

            if (data instanceof FormData) {
                if (obj.hasOwnProperty('resetKeys')) {
                    /**
                    * obj.resetKeys is an array containing name keys to be reset delete.
                    */
                    obj.resetKeys.forEach(key => data.delete(key));
                }
                /**
                 * Checking inputs array
                 */
                data = SubmitForm.#checkFormObjInputs(data, obj);

            }
            if (obj.hasOwnProperty('validate') || obj.hasOwnProperty('rules')) {
                if (obj.validate instanceof Validator) {
                    if (!await Validator.verifyData({ data: data }, obj.validate))
                        return false;
                }
                else {
                    let bool = obj.hasOwnProperty('validate');
                    if (bool && !await Validator.verifyData({ data, ...obj.validate })) {
                        return false;
                    } else if (!await Validator.verifyData({ data, rules: obj.rules })) {
                        return false;
                    }
                }
            };
            if (inJson) {
                /**
                 * Converting formdata or object into json
                 */
                if (!ajaxSettings.hasOwnProperty('contentType')) ajaxSettings['contentType'] = 'application/json';
                if (!ajaxSettings.hasOwnProperty('processData')) ajaxSettings['processData'] = false;
                data = await SubmitForm.objectToJson(data, obj.overwrite);
            }
            ajaxSettings['data'] = data;
            /**
             * End form handling
             * 
             * Start working on success and response
             */
            if (!ajaxSettings.hasOwnProperty('success') && obj.hasOwnProperty('responseElem')) {
                let elem;
                let key = false;
                if (typeof obj.responseElem === 'string') elem = $(obj.responseElem);
                else {
                    elem = $(obj.responseElem['elem']); //It means obj.responseElem is an object
                    key = obj.responseElem['key'];
                }
                ajaxSettings.success = data => {

                    elem.css('display', 'block');
                    if (key) elem.html(data[key]);//key can be message or json key anything
                    else elem.html(data);
                }
            }
            $.ajax(ajaxSettings);
        }

        static inJson(data, json = false) {
            if (json) {
                let jsonData = {};
                data.forEach(field => {
                    jsonData[field.name] = field.value
                });
                return JSON.stringify(jsonData);
            }
            return data;
        }
        /**
         * @param {object} form_data_obj Original object which is created for JSON.stringify()
         * @param {string} key Key where data should be assigned to the form_data_obj
         * @param {array|FileList|IterableIterator} inputs array of inputs 
         * @param {boolean} bool whether fields should be overwritten or not
         * @returns 
         */
        static async #arrayInJsonInloop(form_data_obj, key, inputs, bool) {
            const array = [], textInputs = [];
            for (const input of inputs) {
                if (input instanceof File)
                    array.push(await SubmitForm.readBlobAsBase64(input));
                else {
                    textInputs.push(input);
                }
            }
            if (array.length > 0) form_data_obj[key] = array;
            if (textInputs.length > 0 && array.length > 0) {
                /**
                 * Means files exist with this key so 
                 * add _text end of over text inputs for 
                 * ease on server side.
                 */
                if (bool && textInputs.length > 1)
                    /**
                     * It means with current key files already exists in
                     * this form_data_obj 
                     * So modify array key by _text
                     * And adding it as array because these are multiple 
                     * inpute textInputs.length > 1
                     */
                    form_data_obj[`${key}_text`] = textInputs;

                else
                    /**
                     * This are multiple inputs with same name 
                     * we are overwriting
                     * And file is with same key to
                     * so modify key with _text
                     * and only allow last input to be shown on 
                     * server as string or number
                     */
                    form_data_obj[`${key}_text`] = textInputs[textInputs.length - 1];

            }
            else if (textInputs.length > 0) {
                /**No files so we get to keep the original key  and
                 * no files also suggets that textInputs are more then 1
                */
                form_data_obj[key] = bool ? textInputs : textInputs[textInputs.length - 1];
            }
            return form_data_obj;
        }
        /**
         * @param {FormData} obj 
         * @param {boolean} [json=false]
         */
        static async objectToJson(obj, overwrite) {
            let form_data_obj = {};
            const bool = (overwrite === 'overwritenone' || overwrite === 'overwritefiles');
            /**
             * Creating set because set only holds unique values
             */
            if (obj instanceof FormData) {
                for (let key of new Set(obj.keys())) {
                    let inputs = obj.getAll(key);
                    if (inputs.length > 1) {
                        /**
                         * It means this attribute has multple files Its
                         * name would be something like name[]
                         */
                        form_data_obj = await SubmitForm.#arrayInJsonInloop(form_data_obj, key, inputs, bool);
                    }
                    else {
                        if (inputs[0] instanceof File) form_data_obj[key] = await SubmitForm.readBlobAsBase64(inputs[0]);
                        else form_data_obj[key] = inputs[0];
                    }
                }
            } else {
                for (let key in obj) {
                    if (obj[key] instanceof FileList || Array.isArray(obj[key])) {
                        form_data_obj = await SubmitForm.#arrayInJsonInloop(form_data_obj, key, inputs, bool);
                    } else {
                        if (obj[key] instanceof File)
                            form_data_obj[key] = await SubmitForm.readBlobAsBase64(obj[key]);
                        else
                            /**
                             * Means a normal input
                             */
                            form_data_obj[key] = obj[key];
                    }
                }
            }
            return JSON.stringify(form_data_obj);
        }

    }

    return [Validator, SubmitForm];

})();
/**
 * @name SubmitForm
 * @description It is a SubmitForm class from FormValidator
 * for more details visit https://github.com/Muhthishimiscoding/FormValidatorPlus
 * @version 1.0.0
 * @author Muhthishim Malik 
 * @link https://github.com/Muhthishimiscoding
 * @license MIT
 */
var SubmitForm = (function () {
    'use strict';
   return class SubmitForm {
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
            while (cleanedBase64[(length - paddingCount) - 1] == '=') {
                paddingCount++;
            }
            return sizeInBytes - (paddingCount * 3) / 4;

        }

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
                    throw new TypeError(`Object, FormData and arrays are only allowed ${typeof obj.inputs} is not allowed.`);
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
                // It would be an object
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
                        && !(value instanceof File)
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

        static quickSubmit(obj) {
            let form = SubmitForm.selectElem(obj.form);
            form.onsubmit = async e => {
                e.preventDefault();
                await SubmitForm.justSubmit(obj);
            }

        }

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
            if (typeof Validator == 'function' && (obj.hasOwnProperty('validate') || obj.hasOwnProperty('rules'))) {
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
            if (inJson) data = await SubmitForm.objectToJson(data, obj.overwrite);
            if (!ajaxSettings.hasOwnProperty('contentType') || !ajaxSettings.hasOwnProperty('processData')) {
                /**
                 * Assigning default contentType and processData of ajax
                 */
                if (inJson) {
                    ajaxSettings.contentType = 'application/json';
                    ajaxSettings.processData = false;
                } else if (data instanceof FormData) {
                    ajaxSettings.contentType = false;
                    ajaxSettings.processData = false;
                }
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
})();
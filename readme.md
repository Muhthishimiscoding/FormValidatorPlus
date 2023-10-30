# FormValidator
- [Features](#features)
- [Installation](#Installation)
- [Usage](#method-providers)

FormValidator is your all-in-one solution for simplified form management. Whether you're working on a simple contact form or a complex multi-step wizard, FormValidator streamlines form creation, validation, and submission, making your web development tasks more efficient. It offers a wide range of features to enhance your web development experience.

## Features

#### Effortless Form Validation

FormValidator makes setting up and managing form validation rules a breeze. It offers a comprehensive set of predefined rules, including basic checks like required fields and valid email addresses, as well as advanced criteria like upc-a, ean-13 validation. Configuring validation rules is intuitive, eliminating the need for complex regular expressions and JavaScript functions.

#### Seamless Integration

It uses jquery. It's designed to be versatile and lightweight, ensuring compatibility with your preferred tech stack.

#### Customizable Error Messages

User-friendly error messages are crucial for a smooth user experience. FormValidator allows you to define custom error messages for each validation rule, giving you full control over the feedback your users receive.

#### Effortless Form Submission

FormValidator simplifies form submissions, supporting both traditional and AJAX requests. With just a few lines of code, you can submit form data to your server, handle responses, and display messages to the user. Form submission, file uploads, and response handling have never been easier.

#### Support for Multiple Forms

Managing multiple forms on a single page or within complex wizards is a breeze with FormValidator. The library distinguishes between different forms, ensuring that each form's data is handled independently.

#### Suitable for All Skill Levels

Whether you're a seasoned developer or just starting out, FormValidator simplifies form-related tasks. Experienced professionals appreciate its flexibility, while beginners find it a valuable tool for honing their skills.

## Installation

You can install FormValidator via npm:

```bash
npm install formvalidator
```
or use it from any cdn i.e cdnjs.com, unpkg.com etc.

## Method Providers
Provides two main classes
- [Validator](#validator)
- [SubmitForm](#submitform-class-usage)

### SubmitForm Class Usage

The formValidator library provides a class called `SubmitForm` with various methods for handling form submissions.

#### SubmitForm Available Methods

- [quickSubmit](#quickSubmit)
- [justSubmit](#justSubmit)
- [SelectFiles](#SelectFiles)
- [readBlobAsBase64](#readBlobAsBase64)
- [selectElem](#SelectElem)

##### quickSubmit

The `quickSubmit` method is used for submitting forms. There are two similar functions, `quickSubmit` and `justSubmit`, both of which accept the same [Configuration object](#configuration-object). Both functions handle form submissions, but they differ in the following way:

1. `quickSubmit`: Handles the form submit event automatically. You only need to pass the form selector.
2. `justSubmit`: Does not handle the form submit event, and you need to do it manually.

###### Configuration Object

To use the `quickSubmit` or `justSubmit` method, provide an object with the following properties:

- `form` (required): Represents the form to be submitted. It can be a selector string, an instance of an `HTMLFormElement`, a plain object, or a `FormData` object.

- `ajaxSettings` (required): Contains AJAX configurations such as success, onerror, beforeSend, data, dataType, type, and url.

- `overwrite` (optional): Determines how duplicate keys should be handled when combining existing data and new inputs.

- `resetKeys` (optional): An array of input names that should be removed before submission.

- `inputs` (optional): Additional input data to be included in the submission. It can be a plain object, `FormData` object, or an array of objects.

- `validate` (optional): Provides validation rules and errorMsgs both inside an object with the key `rules` and `errorMsgs`  and optionally you can also pass callback for validation errors which should accept three parameters errors object, rules object and the instance of a validator. Learn more about passing rules [here](#how-to-define-rules-and-errormsgs)

- `rules` (optional): Just Provides validation rules for the validation.

- `responseElem` (optional): Specifies where and how the server response should be displayed, either by passing a selector string or an object with customization options.

###### `overwrite` Options

1. `overwriteAll` (default): Overwrites duplicate keys with the last value.
2. `overwriteNone`: Prevents overwriting and returns an array for duplicate keys.
3. `overwriteFiles`: Only overwrites file inputs, not text inputs.
4. `overwriteButNotFiles`: Overwrites text inputs but not file inputs.

###### Removing Specific Inputs

If you want to exclude specific inputs from the form submission, use the `resetKeys` property in the configuration object. This property should contain an array of input names that should be removed before submission.

###### Adding Additional Inputs

To include extra input data in the submission, use the `inputs` property in the configuration object. This property can be an object, `FormData`, or an array, and its values can be of various types, including strings, numbers, `FILELIST`, or arrays of files.

###### Input Validation

The `validate` property (optional) allows for input validation using a Validator instance or a rules object. Examples of rules are provided in the [Detailed Usage section](#detailed-usage).

###### Displaying Server Responses

The `responseElem` property specifies where and how the server response should be displayed. You can provide a selector string to identify the HTML element where the response should be shown, or pass an object with `elem` (selector string) and `key` (JSON key) for customization.

###### Data Transformation

If the `dataType` property inside the AJAX settings is set to "JSON," all data is automatically converted into valid JSON format. File inputs are transformed into base64 format. If an input contains multiple files, an array of base64-encoded files is assigned to that input.

**Note:** Avoid using base64 encoding for files larger than 20MB due to performance and storage limitations in the user's browser.

###### Examples

Here are some usage examples of the Form Handler Library:

###### Basic Usage

```javascript
// Super easy usage
let easyObj = {
    form: '#myForm',
    ajaxSettings: {
rl: '/submit',
ataType: 'JSON',
    }
};
SubmitForm.quickSubmit(easyObj);

// More detailed example
const formHandlerConfig = {
    form: '#myForm',
    ajaxSettings: {
        url: '/submit',
        dataType: 'JSON',
    },
    overwrite: 'overwriteButNotFiles',
    resetKeys: ['input2'],
    inputs: {
        input1: 'new-value',
        input3: 'additional-data',
    },
    validate: {
    rules: {
        email: 'required|email',
        username: 'required|min:4|max:20|alphaNumeric',
    },
    errorMsgs : {
        email : {
            email : "Please provide a valid email."
        }
    }
},
    responseElem: {
        elem: '.response-container',
        key: 'response'
    }
};
SubmitForm.quickSubmit(formHandlerConfig);
```
###### Detailed Usage

```javascript
/**
 * A little more detailed example
 */
let formElem = document.querySelector('.auth-form');
let files = SubmitForm.selectFiles(formElem); // Can directly pass the string selector too
let formData = new FormData();
formData.append('key', 'value');

let obj = { 'key', 'value1' };

let validate = {
    rules: {
        // Rules object
    },
    errorMsgs: {
        // Error messages object
    }
};
let settings = {
    form: formElem,
    validate,
    overwrite: "overwriteNone",
    resetKeys: ['singleFile', 'multipleFiles[]'],
    inputs: [files, formData, obj],
    ajaxSettings: {
        url: 'http://localhost/layout/index.php',
        dataType: 'JSON',
        success: (data) => {
                console.log(data);
    }
};
// Pass all the configurations inside quickSubmit
SubmitForm.quickSubmit(settings);
```

##### justSubmit
Same as quickSumbmit accepts only one parameter of [configuration objects](#configuration-object).

##### SelectFiles
```javascript 
    /**
     * Select the files from a form
     * @param {HTMLFormElement | string} form Needs to be a form selector.
     * @param {boolean} [fileTobase64=false] If you want to get the files as base64 string
     * make it true
     * @returns {object}
     */
    SubmitForm.selectFiles('.auth-form');
```
If you pass fileTobase64 as true It would return an object check [readBlobAsBase64](#readblobasbase64)

##### readBlobAsBase64
```javascript
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
    let base64obj = await SubmitForm.readBlobAsBase64(input.files[0]);
```

##### selectElem
```javascript
 /**
     * @param {HTMLFormElement | string} selector Resolve a selector or throws error
     * @param {Element}[instance=HTMLFormElement] Type of element you want to select
     *  like HTMLElement, HTMLInputElement etc if your element doesn't match with this slector
     * @param {boolean} [withJquery = false] want to select the element with jquery
     * @returns {HTMLElement} 
     * @throws TypeError
     */
    SubmitForm.selectElem('.my-input', HTMLInputElement, true);
```

### Validator 
The second class which this library provides is called as `Validator`. Has many methods.

#### Static Methods
This methods are for validation.
- [extend](#add-your-own-rules)
- [verifydata](#verifydata)
- [liveVerify](#liveVerify)
- [setRegexSpecial](#setRegexSpecial)
- [setImgMimeTypes](#setImgMimeTypes)
- [getUtcDate](#getUtcDate)
- [getDate](#getDate)
- [getfileSize](#getfileSize)
- [strReplace](#strReplace)

This are input modifiers

- [setMaxdate](#setMaxdate)
- [setNum](#setNum)
- [setPhone](#setPhone)

#### Insatnce Methods
This are instance method useful to know if you are defining your custom rules.
- [Instance Creation](#constructing-the-instance-of-validator)
- [putError](#putError)
- [addError](#addError)
- [getData](#getData)
- [showErrors](#showErrors)
- [baseVerifier](#baseVerifier)
- [getUserError](#getUserError)
- [getError](#getError)
- [isFailed](#isFailed)

#### Available Rules

- [accept](#accept)
- [alpha](#alpha)
- [alphaNumeric](#alphaNumeric)
- [date](#date)
- [dateAll](#dateAll)
- [dateTime](#dateTime)
- [dimension](#dimension)
- [detectMultipleSpaces](#detectmultiplespaces)
- [ean13](#ean13)
- [email](#email)
- [fileExt](#fileext)
- [fileSize](#filesize)
- [fileType](#filetype)
- [hasDigit](#hasDigit)
- [hasLowerCase](#hasLowerCase)
- [hasSpecial](#hasSpecial)
- [hasUpperCase](#hasUpperCase)
- [image](#image)
- [ipv4](#ipv4)
- [ipv6](#ipv6)
- [isbn](#isbn)
- [inList](#inlist)
- [json](#json)
- [lowerCase](#lowerCase)
- [min](#min)
- [max](#max)
- [minnumb](#minnumb)
- [maxnumb](#maxnumb)
- [numb](#numb)
- [numb_space](#numb_space)
- [noRegex](#noregex)
- [noSpace](#noSpace)
- [noSpecial](#noSpecial)
- [password](#password)
- [range](#range)
- [regex](#regex)
- [required](#required)
- [same](#same)
- [shouldOld](#shouldOld)
- [space](#space)
- [tillDate](#tillDate)
- [url](#url)
- [upca](#upca)
- [upperCase](#upperCase)
- [zipCode](#zipCode)


#### Rules Explanation

##### accept 
- This rule is for checkbox that it needs to be checked.

##### alpha

- Validates that a field contains only alphabetic characters (A to Z).
- **Configurations** : If you pass this rules like this
```javascript
let rules = "required|alpha:1";
```
Notice here we pass 1 as an argument to alpha rule it's Validates that a field contains only alphabetic characters (A to Z) and spaces.
```javascript 
let errorMsgs = {
    input: {
lpha_s : "Notice here _s when you pass alpha rule with 1 you need to pass it's error message key appended with _s."

    }
```

##### alphaNumeric

- Validates that a field contains only alphanumeric characters (letters and numbers). It has same configurations as alpha rule (like allowing space).

<!-- ##### alphaNumeric_s

- Validates that a field contains only alphanumeric characters (letters and numbers) and spaces. -->

##### date

- Validates that a date field is in the format YYYY-MM-DD.
```javascript
/**
* Validate a date 
* Allowed formates are:
* 1) YYYY-DD-MM this is default format
* 2) YYYY/DD/MM
* 3) MM/DD/YYYY
* 4) DD/MM/YYYY
* 5) YYYY-MM-DD
*/
let rules = {
    date_input = "date", //when you pass it like this it would use YYYY-DD-MM format for validating date
    date_input_second = "date:MM/DD/YYYY" //format after colon (:)
}
```

##### dateAll

- Validates the date in 5 formats. If any of the formats doesn't match then add its error. To check for the formats see [date](#date).

##### dateTime

- Validates that a date and time field is in the format YYYY-MM-DD HH:MM:SS.

##### dimension 
- Validates the dimension for images. This rule accepts an object which can have following keys:

```javascript 
/**
* @property {array} mimetypes array of mimetypes of images which are allowed if you
* don't pass it here then it would use Validator.imgMimeTypes
*/
let rules = {
    image_input : [

   dimension : {
   width : 900,
   height : 700,//both in px can also pass individually for just checking height or width
   mimetypes : ['image/png','image/jpeg']
 }

    ]
}
/**
* The following compariosns of images can be checked but remember
* pass width and height in px.
* @property {Number} height of the image you want. At a time you can
* only pass height and width.
* @property {Number} width of the image you desire
* @property {array} equal for equal comparion of width and height
* you can pass equal as an array where width would be at 0 index and
* height would be at one index like this [500, 1000]. If you 
* would pass this then no other property would work like smallest
* and highest.
*/
let rules = {
    image_input : [
required',
dimension : {equal : [1200,800]}}//WxH
    ]
}
/**
* @property {array} smallest for the smallest width and height
* for image which you are accepting as an image works
* great with highest property. Array should be like this [90, 120].
*
* @property {array} highest for the highest width and height
* for image which you are accepting as an image.
*/
let rules = {
    image_input : [
required',

   dimension : {
mallest : [1200, 800]//WxH


    ],
    image_input2 : [

   dimension : {
mallest : [1200, 800],
ighest : [1800, 1400]
   }

    ]
}
/**
* @property {number} square It would check if an image is a perfect
* square. If you want the image
* to be just square without defining the size of square you
* can pass it equal to zero 0.
*/
let rules = {
    image_input : [
required',

   dimension : {
quare : 0
   }

    ],
    image_input2 : [

   dimension : {
quare : 500
   }

    ]
}
/**
* @property {string} ratio pass the desired aspect ratio
* here it would compare the desire aspect ratio for the image
* like 16:9.
* @property {number|undefined} difference a number of difference
* which is allowed b/w expected aspect ratio
* and user image aspect ratio the lowest value can be 5e-324.
* The lowest floating point number in js. you can't pass
* 0 here.
* @property {string} key name attribute of your input
* @see getDimensionError 
*/

let rules = {
    image_input : [
required',
 dimension : {equal : "16:9" } }//also pass a number here too
    ]
}
```

##### detectMultipleSpaces 
- This would detect multiple spaces inside an input.

##### ean
- Validates the ean-13 number (European Article Number) .

##### email

- Validates that an email address is in a valid format.

##### fileExt
Validate the extension of file you can pass allowed extensions here.
```javascript
let rules = {
    input : {
ileType :['doc', 'docx', 'pdf', 'epub'] //pass allowed file extensions here without dot
    }
}
```

##### fileSize

- Validates the size of uploaded files.
```javascript
let rules = {
    input : {fileSize : 1024*1024*100}//100Mbs gives number in bytes
}
```

##### fileType

- Validates the type of uploaded files. Pass accepted mimetypes as an array also see [fileExt](#fileExt) and [image](#image)
```javascript
let rules = {
    input : {
ileType :['image/png', 'image/jpeg'] //pass allowed mimeTypes here
    }
}
```
##### hasDigit 
- The field must have atleast one digit.

##### hasLowerCase
- The field should contain atleast one lowercase character.

##### hasUpperCase
- The field should contain atleast one uppercase character.

##### hasSpecial
- The field should contain atleast one special character. It uses `Validator.REG_SPECIAL` to check for special characters.

##### image
Validate the image types It comes with predefined allowed mimetypes.
```javascript
/**
 * If you didn't pass allowed mime types of images
 * then these types would be allowed. These types are accessible by
 * Validator.imgMimeTypes static property of class.
 * image/jpeg, image/jpg, image/png, image/gif, image/bmp, image/webp
 */
let rules = {
    input : "image" // don't need to pass mimeTypes here it has predefined mimeTypes but if you want you can pass mimeTypes
}
```

##### ipv4
- The field under validation needs to be a valid ipv4 address.

##### ipv6
- The field under validation needs to be a valid ipv6 address.

##### isbn
- The field under validation needs to be a valid isbn.

##### isbn 
- Basic validation for the format of isbn number.

##### inList 
- The value must be of any of the array for the rule.
```javascript
let rules = {
    input : [
required', 

   inList : ['apple', 'banana', 'citrus']//user needs to enter any of these value in order to validate the field.

    ]
}
```

##### json
- The field under validation must be a valid json.
```javascript
let rules = {
    input : [
required',
json',//Remember that a string like this " " can be a valid json too so if you only wnat to allow json object pass 1 as an argument to this rule i.e "json:1"
    ]
}
```

##### lowerCase

- Validates that a field contains only lowercase letters.

##### min

- Specifies a minimum character length for a field.

##### max

- Specifies a maximum character length for a field.

##### minnumb

- Specifies a minimum number of digits for a field.


##### maxnumb

- Specifies a maximum number of digits for a field.


##### numb
- The value should be a valid number.

##### numb_space
- The field should be a number but it can have spaces too b/w numbers.
```javascript
let rules = {
    input : "numb_space", // Allow spaces inside numbers
    input_2 : "numb_space:1"// here one would capture multiple spaces like this "     "
}
```

##### noRegex 
- Return false if pattern matches for an input and true when pattern doesn't match, also see [regex](#regex).

##### noSpace
- Validates that a field should not contain any spaces.

##### noSpecial
- The field should not have any special charaters. It uses `Validator.REG_SPECIAL` to check for special characters.


##### password 
- Validates a password. Default minimum characters for password is 8.
```javascript 
/*
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
*     password : "Msg"
*     }
* }
* Second way : 
* {
*      input_password : "Msg"
* }
*/
let rules = {
    input : "password",
    input_2 : "password:10"//here 10 is minimum characters for password
}
```

##### range 
Species a range with the help of array for min and max number respectively
```javascript
let rules = {
    numb_input : ['required', {range : [9, 99]} ]//first minimum number then maximum
}
```

##### required

- Ensures that a field is mandatory and must be filled.

**Notice** : If you pass a rule like min:19 which says minimum 19 characters without required rule and then the user tries to submit the input empty it won't generate any errors because field is not required. Your min rule would only be applied if user tries to fill the field and pass less than 19 characters. This behaviour is because it would be very helpful in many cases i.e you can pass rules for different field without making them required rule would only be applied when user to submit any data through those input. 
If you want to apply the all rules pass required as first rule.
```javascript 
let rules = {
    input : "required|min:19|max:200|alphaNumeric:1";// by passing 1 in alphaNumeric we are allowing space in this field.
}
```

##### regex
- Validate a field against a regex pattern and returns true if pattern matches, also see [noRegex](#noRegex).
```javascript
let rules = {
    input : [{regex : /[^\p{L}0-9\s.]/u}]
}
```

##### space

- Ensures that a field contains at least one space.

**Notice** : On detecting multiple spaces it would
add error with "detectMultipleSpaces" key so for multiple spaces detection pass your error message also with this key.
```javascript 
/**
* @param {true|1} detectMultiple you can pass this rule
* like this input: "space" and also this way
* input: "space:1" means here 1 would make this 
* detectMultiple true and it would
* detect consecutive space like this "  ".
* @returns 
*/
```

##### same 
- The field value must match with the value of another field which name key you passes as the function of this argument useful for confirm password.
```javascript
let rules = {
    confirm_password : [
required',
same:password'
    ]
}
```

##### shouldOld

- Validates that the user's age meets a specified requirement, also see [tillDate](#tilldate).
```javascript
/**
 * Age reuirement rule that user should be x years old to
 * access this feature/content
 * @param {String} value Compare dates by first converting a local date into utc date
 * @param {Number} howManyYears 
 * @returns {boolean}
 * @throws TypeError
*/
let rules = {
    input : {shouldOld : 18}
}
```

##### tillDate

- Ensures that a date input is before a specified date.
```javascript
let rules = {
    input : {tilldate:-19},// - for past years, you can pass date instance and also date like this "2023-09-05" in YYYY-DD-MM formate

    input_two : {tilldate: "2023-09-05"}
}
```

##### upperCase

- Validates that a field contains only uppercase letters.

##### upca
- The field under validation needs to be a valid upc-a (Universal Product Code) format.

##### url 
- The field under validation must be a valid http url. If you want to allow ftp urls to you can pass 1 as an argument to this function and then if you also want to give the custom error msg for this field you need to use the url_ftp key to send it's error message.

```javascript
let validate = {
    rules : {
nput : ['required', 'url'],
nput2 : ['required', 'url:1']
    },
    errorMsgs : {
nput2 : {
   url_ftp : "This field needs to be a valid http or ftp url."

    }
}

```

##### zipCode
- Validates a zip code.

#### Explanation of Static Methods.

##### Add your own rules.

- This library empowers you to add your own custom rules with ease. Use `extend` static method for this purpose.

###### extend Parameters

A validation rule typically consists of a callback function, a rule name, and an error message. Here's an explanation of these parameters:

- **callback (Function|Object):** This is the core of your validation rule. You can define a callback function to check the input's validity. Alternatively, you can use an object to add multiple rules at once.

  Every function you pass, it must return one of the following values:
  
  - `1`: Indicates that the rule found no errors.
  - `2`: Implies that an error was detected, and it has been added to the errors object. No further rules will be applied to the input. You can use the `putError` function to add the errors.
  - `0` or `false`: Signifies that the rule found an error, and no other rules will be applied to the input. The main difference between `2` and `0` is that in the `0` case, the verifier adds its error to the errors object automatically, while in the `2` case, you need to add your error manually.

  The callback function takes the following parameters:
  
  - `value`: The input value to which the rule is being applied.
  - `extras`: This parameter can be `null`, an object, a string, or a boolean, depending on the constraints you've specified with your rule (e.g., "min:6"). For example, an object of dimension might be passed as extras, like `{ width: "80px", height: "100px" }`.
  - `key`: The name attribute of your input element.
```javascript
Validator.extend(
    function(value, extras, key){
        return extras.includes(value);
    },
    'insideTheList', 
    'The input should be any of the these values'
    );
```
  If you use an object, you can encapsulate multiple functions within it, along with associated error messages.
```javascript
let rulesObj = {
    firstRule : {
        callback : function(value, extra, key){
                // logic of rule
        },
        errorMessage : "Error message for firstRule"
    },
    secondRule : {
        callback : function(value, extra, key){
             // logic of rule
        },
        errorMessage : "Error message for secondRule"
    }
}
// here the rule name is firstRule and secondRule respectively.
Validator.extend(rulesObj);
```
- **ruleName (String|null):** This parameter specifies the name of your custom validation rule, such as "required" or "email." If you pass the object for rules then this parameter is not required otherwise it is necessary and on abscence throws error.

- **errorMessage (String|null):** The error message associated with your rule. If you pass the object for rules then this parameter is not required otherwise it is necessary and on abscence throws error.

##### verifyData
- This function accepts two parameters. It verifies given data against rules.
```javascript
/**
* @param {object} obj can either only contain data for validation
* or can also have rules and custom error messages etc.
* @property {object|FormData} data | 
* @property {object} rules 
* @property {object | undefined} errorMsgs 
* @property {Function|undefined} [callback=null] if you give give callback as a function
* then it must should accept two parameters an error object where key would be name of 
* your invalid input field and it's value would be error messages.
* The second parameter would be all rules.
* @param {Validator|null} [formValidator = null] You can also pass Validator class instance if
* it contains rules, error Msgs and data to validate.
*/
//SubmitForm class use this function to validate data
await Validator.verifyData(obj, formValidator = null)

```

##### liveVerify

- This static method enables live error checking and shows error to users on input, focus and blur events.

```javascript 
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
   * 4 parameters inside your callback
   * i) First would be key which is name of the current input you 
   * pass inside rule 
   * ii) Second would be errors object
   * which would contain errors for all inputs.
   * iii) Third would be rules.
   * iv) verifier instance
   * @throws {TypeError} - If callBack is not a function.
*/
let verifierObj = {
    rules : {
input : "required|min:6|max:200"
    },
    errorMsgs : {
input : {
      required : "This input is required so please pass a value inside it."
}
    },
    callback : function(key, errorObj, rules){
console.log(key, errorObj, rules);
    }
}
//Hint: Verifydata and liveVerifier both accepts same object 
Validator.liveVerify(verifierObj);

Validator.verifyData(verifierObj);
```

##### setRegexSpecial 

- Sets the static property of `Validator.REG_SPECIAL` accepts regex as parameter.

##### setImgMimeTypes 

- Sets the static property of `Validator.imgMimeTypes` accepts regex as parameter.

##### getUtcDate
- Gives utc date for a normal date.
```javascript
/**
* Gives a utc date for a normal date
* @param {Date | null} date 
*/
Validator.getUtcDate(new Date('2023-09-09'));
```

##### getDate

- If you pass a number like 5 it would give a future date of 5 years form a current date and month and if you pass -5 then it would give a past date.

```javascript
/**
 * Resolve howManyYears and give a utc calculated date 
 * @param {Number | Date | String | null} howManyYears 
 * @returns {Date}
 */
Validator.getDate(12);
```

##### getfileSize
- Get file size in human readable format.
```javascript
/**
 * @param {Number} size in bytes
 * @retruns {string}
*/
Validator.getfileSize(1024*1024*3);//outputs 3mb
```

##### strReplace 
```javascript
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
* @returns {string}
*/

Validator.strReplace("This field should contain {min} characters.",  {min: 8});
// outputs "This field should contain 8 characters."

```


#### Input Modifiers

##### setMaxdate

- For input type date set max attribute as given date.
```javascript
/** 
* Sets the max attribute for your input element date like if you want the user to
* select only between 2005 16 october it can do this for you.
* @param {string|HTMLInputElement} selector 
* @param {null|Date|Number} [toDate=null] In number case it should be years count 
*/
Validator.setMaxdate(".data-input", 9);//sets the date for 9 years
```

##### 
```javascript
/**
* Set the Input as a formatted phone number input
* @param {string|HTMLInputElement|HTMLTextAreaElement} selector - Selector or 
* element to format.
* @param {boolean} [allowCode=false] - Whether to allow country codes.
* @param {number} [numCount=10] - Maximum number of digits allowed in 
* the phone number.
* @param {number[]} putSpaces - Array of positions where spaces should be addedfor formatting
* number.
*/
Validator.setPhone(".phone-input", true, 10, [2,5]);
```

##### setNum 
- Sets an input as a number.
```javascript
/**
* Set the field a valid number 
* @param {string|HTMLElement} selector 
* @param {false|Number} [setMax=false] The max number which is allowed 
* as input
*/
Validator.setNum(".numb-input", 90);
```

#### Instance methods 

##### How to define `rules` and `errorMsgs`?

- How to define `rules` and `errorMsgs`?

###### Rules Object

- **`rules` (Type: Object)**

   The `rules` object is used to define validation rules for input fields. It contains key-value pairs where the key is the input field's name attribute, and the value can be either a string or an array. Inputs can have multiple rules.

   - **Rules as a String**: 
     If using a string, rule constraints are added after the rule name, separated by a colon (":"). For example:
     
     ```javascript
     rules: {
       username: 'required|min:4|max:12'
     }
     ```

   - **Rules as an Array**: 
     If using an array, you can pass pre-configured static rule names for validation (they are not for all rules). This is particularly useful for complex rules. For example:

     ```javascript
     rules: {
       username: [
         'required',
         {
           min: 4
         },
         'max:12'
       ]
     }
     ```

###### Error Messages

- **`errorMsgs` (Type: Object)**

   Error messages can be passed as a sub-object or using concatenated names. This allows for custom error messages for specific rules.

   - **Error Messages as a Sub-Object**: 
     In this method, you create a sub-object to specify error messages for different rules of an input. For example:

     ```javascript
     errorMsgs: {
       username: {
         min: "Minimum length is not met",
         max: "Maximum length is exceeded."
       },
       otherinput: {
         min: "This is a custom error message"
       }
     }
     ```

   - **Error Messages Using Concatenated Names**: 
     In this approach, error messages are defined using concatenated names, useful for inputs with a single rule. For example:

     ```javascript
     errorMsgs: {
       username_min: "Minimum length is not met",//conctatenated with "_"
       username_max: "Maximum length is exceeded",
       otherinput_min: "This is a custom error message"
     }
     ```

   - **Special Cases**: 
     Some error messages have unique keys not directly matching the function names. These include:
     
     1. For alpha and alphaNumeric with spaces, you can append "_s" to the key (e.g., alpha_s).
     2. For the URL function, if you want to allow FTP URLs, the error message should have a key like "url_ftp."
     3. Password validation uses functions like hasLowerCase, hasUpperCase, hasDigit, min, and hasSpecial. You can specify error messages with these function names or just use password.
     
   - **Image Dimension Error Messages**: 
     The "Dimension" rule has sub-attributes like "width" and "height." Error messages for these can be defined in two ways:

     1. As a sub-object under the "input" key.
     2. Using concatenated names, e.g., "input_dimension_width" and "input_dimension_height."

##### Constructing the instance of Validator.

- Well it's not neccessary to create the instance of Validator for validation but if you liked to pass Validator instance as a parameter to the `SubmitForm.quickSubmit` function. You can do it like this.

```javascript
let validate = new Validator(rulesObj, errorMsgs);
let configObj  = {
    validate // in ES6 syntax validate is property is assigned
    // All other properties of configObj
};

```

##### putError
- Add errors in error object also [strReplace](#strreplace).
```javascript
/**
* Add errors in errors object with replacements
* @param {string} key Name of the input you want to add error.
* @param {string} ruleName Name of your rule.
* @param {object|null} replaceMents is the parameter of strReplace
* @param {boolean} [curlyBraces=true] is the parameter of strReplace
* @returns {2}
*
*/

putError(key, ruleName, replaceMents = null, curlyBraces = true) 
```

##### getData
- Get the value of the given input name attribute.
```javascript
/**
* Returns the data specific for rule by data object or input value or files
* @param {string} key  Name attribute of input
* @param {boolean} [all=false]  In case of array of fileList it just
* returns element at 0 index if you want to get the complete array
* and filelist make it true. If you pass all as true then it would 
* always return Array or FileList.
* @returns {Array|FileList|string}
*/
getData(key, all);
```

##### showErrors
- Show errors on frontend. Accepts an opional parameter which should be the name attribute of your input.

##### baseVerifier
- Verifies against a single rule.
```javascript
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
baseVerifier(ruleName, key, extra, v);
```

##### getUserError
- Get the user given error for the rule if user gave any rule otherwise return undefined.
```javascript
/**
 * @param {string} key Name attribute of the input.
 * @param {string} ruleName Rule name like required etc.
*/
getUserError(key, ruleName);
```

##### getError
- It returns error for the given rule and key. The difference b/w getUserError and getError is that getUserError only returns user given errors where as getError also uses `errorMessages` object to get the error for the rule.

```javascript
getError(input_name_attr, ruleName, defaultMessage = "An unknown error occured.");
```

##### isFailed
- Retruns true when validation passes otherwise return false.

#### Usage

```javascript
 let validate =  {
    rules : {
        url : 'url:1',
        myinput : 'required|min:6|max:12|email',
        textarea : [
                    'required',
                    {
                        min : 19
                    }
                ],
        checkbox : 'accept',
        dateTime : ['date', {tillDate : -19}],
        singleFile :[
                        Validator.RULE_REQUIRED,// 'required'
                        {
                            fileSize: (1024*1024)*3
                        },
                        {
                            dimension: {
                                smallest : [735, 1102], 
                                highest : [1000, 1500]
                            }
                        }
        ],
        zipCode : 'zipCode',
        newInput : 'required|min:6',
        numb : [
                    {
                        range : [4,9]
                    },
                    {
                        numb_space : true
                    }
        ],
        password : 'required|password',
        conpassword : 'required|same:password',//passing name key of password to match its value
        inList_input : [
                    {
                        inList : ['abc', 'cdf', 'ghj']
                    }
        ],
        inList_input2 : [
                    'required',
                    {
                        inList : ['abc', 'cdf', 'ghj']
                    }
        ] ,
        json_input : 'json:1'//allowing only json objects
    },
    
    errorMsgs : {
        myinput: {
        required: "This is a custom message for required field",

        },
        singleFile : {
            fileSize : "The file size exceeds max file size which is 3mb."
        },
        url : {
            url_ftp : 'The entered url is not a valid url'
        },
        
    },
    callback : function(errors, rules, verifierInstance){
        verifierInstance.showErrors();
        //You want to show the errors and also log the errors
        console.log(errors, rules);
        
        }
}
let obj = {
    validate,
    //All other properties
}
SubmitForm.quickSubmit(obj);

```
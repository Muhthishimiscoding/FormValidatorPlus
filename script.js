/**
 * This file show a usage of FormValidtor
 */
let form = document.querySelector('.auth-form');

let formdata = new FormData();

Validator.setMaxdate('#date', 18);

Validator.setPhone('[name="numb"]', true);

formdata.append('myformdatakey', 'myformdatavalue');

formdata.append('myformdatakey', 'This is a dublicate of all myformdatakey');

let callBackObj = {
    newRule : {
        callback : function(v, e,k,addError){
        return v === 'Important value';
    },
        msg : "New rule validates that your input value should be 'Important value'."
    },
    customRule : {
        callback : function(v,e,k,addError){
            console.log(v,e,k,addError);
            return v=="Hi";
        },
        msg : "Your given value should be 'Hi'."
    }
}
Validator.extend(callBackObj);
let validate = {
    rules: {
        url: 'url:1',
        myinput: 'required|min:6|max:12|email',
        textarea: { min: 19 },
        checkbox: 'accept',
        dateTime: ['date', { tillDate: -19 }],
        singleFile: ['required',
            { fileSize: (1024 * 1024) * 3 },//5mb (1024*1024)*5
            {
                dimension:
                    { smallest: [735, 1102], highest: [1000, 1500] }
            }
        ],
        zipCode: 'zipCode',
        newInput: 'required|min:6',
        anInput: [
            'required',
            {
                any_of_rules: [
                    "zipCode",
                    "min:9"
                ]
            }],
        numb: [
            {
                range: [4, 9]
            },
            { numb_space: true }
        ],
        password:
        {
            any_of: {
                password: 'required|password',
                conpassword: 'required|same:password',
            }
        },
        field1: {
            only_any_of: {
                makeInvalidEmpty: true,
                // Either field1 should be email or field2 should be numb both can't happen at the same time
                fields : {
                    field1: "required|email",
                    field2: "required|numb"
                },
            }
        },
        // password : 'password',
        // conpassword : 'same:password',
        inList: [{
            inList: ['abc', 'cdf', 'ghj']
        }],
        n: ['required', {
            inList: ['abc', 'cdf', 'ghj']
        }],
        json: 'json:1',
        upc: 'required|dateTime',
        myRule : 'customRule',
        newRule:'newRule',
        customInput : {
            notRule : ['zipCode','min:9']
        }
    },

    errorMsgs: {
        myinput: {
            required: "This is a custom message for required field",

        },
        singleFile: {
            fileSize: "The file size exceeds max file size which is 3mb."
        },
        url: {
            url_ftp: 'The entered url is not a valid url'
        },
        anInput_any_of_rules: "This field either needs to be a zip code or contains 9 characters.",
        password: {
            any_of: "Either the password should be a password or conpassword match with password."
        },
        conpassword: {
            same: "Either the password should be a password or conpassword match with password."
        },

        field1: {
            only_any_of: {
                matchNone: "Either you give email in this field or you give number in the field2.",
                matchMultiple: "You pass the email in this field and also number in the field2. You need to just choose one field.",
                makeInvalidEmpty: "Make this field empty."
            }
        },
        field2: {
            only_any_of: {
                matchNone: "Either you give number in this field or you give email in the field1.",
                matchMultiple: "You pass the number in this field and also email in the field2. You need to just choose one field."
            }
        },
        customInput_notRule : "The field must be empty."

    },
    // callback : function(errors){
    //     console.log(errors);
    // }
}

let obj = {
    form: form,
    // validate,
    overwrite: "overwritenone",
    overwrite: "overwriteFiles",
    resetKeys: ['singleFile', 'multipleFiles[]'],
    ajaxSettings: {
        url: 'http://localhost/layout/index.php',
        // dataType: "json",
        success: (data) => {
            console.log(data);
        },
        // contentType : false, no need it to set it
        // processData: false
    },
};
form.onsubmit = async e => {
    e.preventDefault();
    let filesObj = await SubmitForm.selectFiles(form);
    obj.inputs = [filesObj, { "myinput": "o@gmail.com" }, formdata];
    console.log(filesObj);
    SubmitForm.justSubmit(obj);

}

Validator.liveVerify({ ...validate, callback: null });

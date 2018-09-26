import {validators} from "vue-form-generator";

export const schemaIdentifier={
    fields:[
      {
        type: "input",
        inputType:"text",
        model: "identifier",
        label: "Identifier",
        placeholder: "Your ID ...",
        featured: true,
        required: true,
        validator: validators.string
      }
      ]
  };

export const schemaPassword = {
    fields:[
      {
        type: "input",
        inputType:"password",
        model: "password",
        label: "Password",
        placeholder: "Your password ...",
        min: 6,
        hint: "Minimum 6 characters",
        featured: true,
        required: true,
        validator: validators.string
      }
      ]
  };
import {validators} from "vue-form-generator";
import pdRef from '../../crypto/key-derivators/password-derivators-ref'

export const login = {
  type:        "input",
  inputType:   "text",
  model:       "identifier",
  label:       "Identifier",
  placeholder: "Your ID ...",
  featured:    true,
  required:    true,
  validator:   validators.string
};

export const password = {
  type:        "input",
  inputType:   "password",
  model:       "password",
  label:       "Password",
  placeholder: "Your password ...",
  min:         6,
  hint:        "Minimum 6 characters",
  featured:    true,
  required:    true,
  validator:   validators.string
};

export const name = {
  type:        "input",
  inputType:   "text",
  model:       "name",
  label:       "Name",
  placeholder: "How do you want to be called ?",
  featured:    true,
  required:    true,
  validator:   validators.string
};

export const algorithm = {
  type:      "select",
  model:     "algorithm",
  label:     "Authentication emthod",
  values:    Object.keys(pdRef),
  featured:  true,
  required:  true,
  validator: validators.string
};
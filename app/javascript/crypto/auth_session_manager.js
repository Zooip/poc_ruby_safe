import forge from 'node-forge'

import passwordDerivatorRef from './key-derivators/key-derivator-ref'


class AuthSessionManager {

  constructor(password, passwordDerivator, challenge) {
    this.password = password;
    this.algorithm=passwordDerivator;
    this.challenge=challenge;

    this.signer= new passwordDerivatorRef[passwordDerivator.algorithm](passwordDerivator.params)
  }

  encodedSignaturePromise() {
    return this.signer.encodedSignaturePromise(this.password, this.challenge)
  }
}

export default AuthSessionManager;
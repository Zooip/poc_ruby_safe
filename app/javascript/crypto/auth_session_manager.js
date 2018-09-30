import forge from 'node-forge'

import passwordDerivatorsRef from './key-derivators/password-derivators-ref'


class AuthSessionManager {

  constructor(password, passwordDerivator, challenge) {
    this.password = password;
    this.algorithm=passwordDerivator;
    this.challenge=challenge;

    this.signer= new passwordDerivatorsRef[passwordDerivator.algorithm](this.password,passwordDerivator.params)

    console.log("Signer: ", this.signer)
  }

  encodedSignaturePromise() {
    return this.signer.encodedChallengeSignaturePromise(this.challenge)
  }
}

export default AuthSessionManager;
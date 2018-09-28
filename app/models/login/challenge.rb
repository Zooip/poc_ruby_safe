module Login
  class Challenge
    include ActiveModel::Model

    CHALLENGE_SIZE = 48 #in bytes

    attr_accessor :identifier,
                  :challenge

    def digest_algorithm
      "sha256"
    end

    def to_h
      {
        value:            challenge,
        digest_algorithm: digest_algorithm,
        expires_at:       (DateTime.now + 5.minutes).iso8601
      }
    end

    def verify(signature)
      identifier.public_key.rsa_key.verify(build_digest, signature, challenge)
    end

    def build_digest
      OpenSSL::Digest::SHA256.new
    end

    def self.generate_for(identifier)
      new(
        identifier: identifier,
        challenge:  random_challenge
      )
    end

    private

    def self.random_challenge
      SecureRandom.base64(CHALLENGE_SIZE)
    end

  end
end  

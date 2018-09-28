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

    def digested_challenge
      build_digest.digest(challenge)
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

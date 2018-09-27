class AuthChallenge

  CHALLENGE_SIZE=48 #in bytes

  include ActiveModel::Model

  attr_accessor :identifier,
                :challenge

  def encoded_challenge
    Base64.encode64(challenge).delete("\n")
  end

  def self.generate_for(identifier)
    new(
      identifier: identifier,
      challenge: random_challenge
    )
  end

  def digest_algorithm
    "sha256"
  end

  def to_h
    {
      encoded: encoded_challenge,
      digest_algorithm: digest_algorithm,
      expires_at: (DateTime.now+5.minutes).iso8601
    }
  end

  def verify(signature)
    identifier.public_key.rsa_key.verify(new_digest, signature, challenge)
  end

  private

  def self.random_challenge
    SecureRandom.random_bytes(CHALLENGE_SIZE)
  end

end
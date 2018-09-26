class AuthChallenge

  CHALLENGE_SIZE=24 #in bytes

  include ActiveModel::Model

  attr_accessor :user,
                :challenge

  def encoded_challenge
    Base64.encode64(challenge).delete("\n")
  end

  def self.generate_for(user)
    new(
      user: user,
      challenge: random_challenge
    )
  end

  def digest_algorithm
    "sha256"
  end

  def verify(signature)
    user.public_key.rsa_key.verify(new_digest, signature, challenge)
  end

  private

  def self.random_challenge
    SecureRandom.random_bytes(CHALLENGE_SIZE)
  end

  def new_digest
    OpenSSL::Digest::SHA256.new
  end

end
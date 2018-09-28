module Login
  module PublicKeys

    # A RSA public key that will never verify a signature
    # Used when in paranoid mode to mitigate timing Attack
    #
    class NullRsa < BasePublicKey
      def pem
        DEFAULT_PEM
      end

      def rsa_key
        pem&&OpenSSL::PKey::RSA.new(pem)
      end

      def verify(signature:, challenge:)
        rsa_key.verify(challenge.build_digest, "This is not going to work !", challenge.challenge)
      end
    end
  end
end

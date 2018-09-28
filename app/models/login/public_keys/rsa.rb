module Login
  module PublicKeys
    class Rsa < BasePublicKey

      field :pem, type: String

      def rsa_key
        pem&&OpenSSL::PKey::RSA.new(pem)
      end

      def verify(signature:, challenge:)
        rsa_key.verify(challenge.build_digest, signature, challenge.challenge)
      end

    end
  end
end

require "ed25519"

module Login
  module PublicKeys
    class Ed25519 < BasePublicKey
      field :pubkey_binary, type: BSON::Binary

      def encoded_pubkey
        Base64.encode64(pubkey_binary).delete("\n")
      end

      def encoded_pubkey= v
        self.pubkey_binary = BSON::Binary.new(Base64.decode64(v))
      end

      def verify_key
        ::Ed25519::VerifyKey.new(pubkey_binary.data)
      end

      def verify(signature:, challenge:)
        begin
          verify_key.verify(signature, challenge.digested_challenge)
        rescue ::Ed25519::VerifyError
          false
        end
      end

    end
  end
end

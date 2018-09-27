module Login
  module CredentialsRetrievers
    class Default

      def initialize
      end

      def retrieve(identifier)
        User.find_by('credentials_entry.identifier'=>identifier)&.credentials_entry
      end

    end
  end
end
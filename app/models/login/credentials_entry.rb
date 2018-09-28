module Login
  class CredentialsEntry
  
    include Mongoid::Document
    embedded_in :user
  
    field :identifier, type: String
  
    embeds_one :password_derivator, class_name: "Login::PasswordDerivators::BaseDerivator"
  
    embeds_one :public_key, class_name: "Login::PublicKeys::BasePublicKey"
  
  
  end
end
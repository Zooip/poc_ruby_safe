class CredentialsEntry

  include Mongoid::Document
  embedded_in :user

  field :identifier, type: String

  embeds_one :password_derivator, class_name: "PasswordDerivators::BaseDerivator"


end
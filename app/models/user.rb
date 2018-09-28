class User
  include Mongoid::Document

  field :name, type: String

  embeds_one :credentials, class_name: "Login::CredentialsEntry", autobuild: true

  index({ "credentials.identifier" => 1 }, { unique: true })


end

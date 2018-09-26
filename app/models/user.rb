class User
  include Mongoid::Document

  field :identifier, type: String
  field :name, type: String

  field :password_derivation_options, type: Hash
  embeds_one :public_key

end

class User
  include Mongoid::Document

  field :name, type: String

  embeds_one :credentials_entry, autobuild: true

end

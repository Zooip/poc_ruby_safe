class PublicKey

  include Mongoid::Document

  embedded_in :user

  field :pem, type: String

  def rsa_key
    OpenSSL::PKey::RSA.new(pem)
  end

end
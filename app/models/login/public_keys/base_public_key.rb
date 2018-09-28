module Login
  module PublicKeys
    class BasePublicKey
  
      include Mongoid::Document
      embedded_in :credentials_entry
  
    end
  end
end  

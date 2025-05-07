/* Crea 3 usuarios si la tabla no existe */
if (!localStorage.getItem('qr_users')){
    localStorage.setItem('qr_users', JSON.stringify([
      {id:1,user:'Admin',      pass:'admin123',   rol:'ADMIN'},
      {id:2,user:'QR_Support', pass:'support123', rol:'QR_SUPPORT'},
      {id:3,user:'Prof_Juarez',pass:'prof123',    rol:'PROFESOR'},
    ]));
  }
  
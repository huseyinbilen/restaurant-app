# Restaurant App
## Hikaye
 - Bu uygulamada user ve restauran diye iki tip kullanıcı olacak.
 - Bu kullanıcılar kayıt olma ve giriş çıkış işlemleri yapabilecek.
  - Kullanıcı giriş yaptıktan sonra yemek sipariş edebilirken restoran menü ekleyip silebilecek.
  - Kullanıcı arama, sipariş, yorum ve puan verebilecek.
## Detay
  - iki tip kullanıcı içinde iki farklı jwt mekanizması kullanıldı. Böylece tokenlar hangi grup için üretildiyse o gruba ait işlemlerde kullanılabilecek
## Kurulum
### Backend
Sırasıyla aşağıdaki komutlar çalıştırılır.
```
npm install
npm run start
```
## Kullanılan Paketler
### Backend
- **jsonwebtoken**
- **cors**
- **dotenv**
- **express**
- **mongoose**
- **nodemon**
- **ts-node**

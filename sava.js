const fs = require('fs');
const request = require('request');
const EventEmitter = require('events');

class Sava extends EventEmitter {
   constructor(options){
      super();

      let { 
         url, 
         log_file, 
         timeout = 10, 
         interval = 60, 
         max_errors_streak = 15, 
         body_size = 0,
         dev = false,
      } = options;

      this.aid;
      this.url = url;
      this.timeout = timeout * 1000;
      this.interval = interval * 1000;
      this.max_errors_streak = max_errors_streak;
      this.body_size = body_size;
      this.errors_streak = 0;

      if(typeof log_file !== 'undefined'){
         this.logger = fs.createWriteStream(log_file, { flags: 'a' });
      }
      
      if(dev){
         console.log(' ___    __  _  _  __   ');
         console.log('/ __)  /__\\( \\/ )/__\\  ');
         console.log('\\__ \\ /(__)\\\\  //(__)\\ ');
         console.log('(___/(__)(__)\\/(__)(__)');
         console.log('');
         console.log('URL:               ' + url);
         console.log('LOG FILE:          ' + log_file);
         console.log('TIMEOUT:           ' + timeout, 'sec');
         console.log('INTERVAL:          ' + interval, 'sec');
         console.log('MAX ERRORS STREAK: ' + max_errors_streak);
         console.log('');
      }
   }

   check(){
      let time = Date.now();

      request({ url: this.url, encoding: null, timeout: this.timeout }, (err, res, body) => {
         let date = new Date;
         let status = 'ok';
         let message = 'works as expected';
         let delay = Date.now() - time;
         let size;

         if(err){
            status = 'error';
            if(err.message.indexOf('ETIMEDOUT') != -1){
               message = 'server does not respond';
            }else if(err.message.indexOf('ENOTFOUND') != -1){
               message = 'wrong url';
            }else{
               message = err.message;
            }
         }else{
            let res_body_size = body.length;

            if(res.statusCode !== 200){
               status = 'error';
            }

            if(res_body_size !== this.body_size){
               status = 'error';
               message = `wrong response body size: ${res_body_size} bytes`;
               size = res_body_size;
            }
         }

         if(status == 'error'){
            this.errors_streak++;
            if(this.errors_streak == this.max_errors_streak){
               this.emit('alarm', { message });
            }
         }else{
            // Clear errors streak
            this.errors_streak = 0;
         }


         let result = { date, status, message, delay, size };


         // Emit result as event
         this.emit('update', result);

         // Save result localy
         if(this.logger){
            this.logger.write(Object.values(result).join(';') + `\r\n`);
         }
      });
   }

   schedule(){
      clearInterval(this.aid);
      this.aid = setInterval(this.check.bind(this), this.interval);
      this.check();
   }

   destroy(){
      clearInterval(this.aid);
      if(this.logger){
         this.logger.kill();
      }
   }
}

module.exports = Sava;

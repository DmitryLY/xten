window.addEventListener('DOMContentLoaded', function(){
    
    var inputs = {};

    function calculate(){
        var credit, percents, monthly_payment_;

        var reg = /\s+/g;

        var summ_cost = parseInt(inputs.summ_cost.input.value.replace(reg,'').replace(/,/,'.'));
        var first_payment = parseInt(inputs.first_payment.input.value.replace(reg,'').replace(/,/,'.'));
        var percent = Number(inputs.percent.input.value.replace(reg,'').replace(/,/,'.'));
        var period = parseInt(inputs.period.input.value.replace(reg,'').replace(/,/,'.'));

        item_total_credit.innerText =  parseInt(credit = summ_cost - first_payment).toLocaleString('ru-RU');


        item_total_percents.innerText = parseInt( percents = credit * (percent/100) * period ).toLocaleString('ru-RU');
        item_total_plus.innerText = parseInt( percents + credit ).toLocaleString('ru-RU');

        monthly_payment_ = (percents + credit) / ( 12 * period );
        item_total_money.innerText = parseInt( monthly_payment_ + 16242 ).toLocaleString('ru-RU');


        monthly_payment.innerText = parseInt(monthly_payment_).toLocaleString('ru-RU');


    }

    function formatNum( num ){
        typeof num == 'string' && ( num = Number( num.replace(/[^\d\,\.]/g,'').replace(',','.') ) );
        return num.toLocaleString('ru-RU');
    } 

    {

        let fields = document.querySelectorAll('#calculator #left .field');

        function setDataValue( value, e ){

            var { input, availValues, range_bar_box, range_bar, slider, max, callback } = this;
            
            var maxValue = 0;
            
            if( callback || max ){
                e && (value = callback(value));
                maxValue =  typeof max == 'function' ? max(): parseInt(max);
                value > maxValue && ( value = maxValue ) ;
            }else
                for( let value of availValues ){
                    let valueNum = Number(value);
                    if( valueNum > maxValue )
                        maxValue = valueNum;
                }
                    
            input.value = formatNum(value);

            var range_bar_box_width = range_bar_box.offsetWidth;
            var valueRel = value / maxValue ; 
            
            range_bar.style.width = valueRel * 100 + '%';
            slider.style.left = ( valueRel * range_bar_box_width - slider.offsetWidth / 2 ) / range_bar_box_width * 100 + '%';
            
            calculate();
            
        }

        for( let field of fields){
            let field_items = field.querySelector('.field_items');
            let availValues = [];
            let max = undefined;
            let input = field.querySelector('input');
            var range_bar_box_bind ={};
            var bind = {};


            if( field_items ){

                field_items = field_items.getElementsByClassName('field_item');

                for( let field_item of field_items){
                    let dataValue = field_item.getAttribute('data-value');
                    if( dataValue === undefined ) continue;
        
                    field_item.addEventListener('click', setDataValue.bind( range_bar_box_bind, dataValue ))

                    availValues.push( dataValue );
                }


            }

            let range_bar_box = field.querySelector('.range_bar_box');
            
            if( range_bar_box ){

                max = input.name == 'first_payment' ? function(){ return parseInt( parseInt(inputs.summ_cost.input.value.replace(/\s+/g,'').replace(/,/,'.')) * 0.8 ); } : range_bar_box.getAttribute('data-value-max');

                let slider = range_bar_box.querySelector('.slider');
                let range_bar = range_bar_box.querySelector('.range_bar');

                range_bar_box_bind.input =input;
                range_bar_box_bind.range_bar_box = range_bar_box;
                range_bar_box_bind.slider = slider;
                range_bar_box_bind.range_bar = range_bar;
                range_bar_box_bind.availValues = availValues;
                range_bar_box_bind.max = max;

                let bind_listener = startRangeBar.bind( range_bar_box , range_bar_box_bind );
                
                slider.addEventListener('mousedown', bind_listener );
                slider.addEventListener('touchstart', bind_listener );
                
                inputs[input.name] = range_bar_box_bind;
            }

            if( input.name == 'first_payment' ){
                range_bar_box_bind.callback = function(v){
                    return parseInt( parseInt(inputs.summ_cost.input.value.replace(/\s+/g,'').replace(/,/,'.')) * (1/(100/v)) );
                };
            }else if( input.name == 'summ_cost' ){

            }

        }

        
        function setRangeValue( {input,availValues, range_bar, slider, range_bar_box, max} ){
                
                var relValue = parseFloat( range_bar.style.width );
                var maxValue = 0;


            

            if(max){

                input.value = formatNum( parseInt( relValue/100 * ( typeof max == 'function' ? max() : max ) ) );

            }else if( availValues.length ) {
                var nearedValue = availValues[0];

                for( let value of availValues ){
                    let valueNum = parseInt(value);
                    if( valueNum > maxValue )
                        maxValue = valueNum;
                }

                var nearedValueRel = availValues[0] / maxValue * 100;

                for( let value of availValues ){
                    let relVal = (value / maxValue) * 100;
                    
                    if( Math.abs( relValue - relVal ) < Math.abs( nearedValueRel - relVal ) ){
                        nearedValue = value;
                        nearedValueRel = relVal;
                    }
                }

                input.value = formatNum( nearedValue );

            } 

            if( input.name == 'summ_cost' ){ 
                setDataValue.call( inputs.first_payment, parseInt(inputs.first_payment.input.value.replace(/\s+/g,'').replace(/,/,'.')) ) 
            }

            calculate();
           
        }

        function startRangeBar(bind,e){

            if( e.which != 1 && e.which != 0 ) return;

            let x = e.clientX || e.changedTouches[0].clientX || 0;
            let range_bar_box_width = this.offsetWidth;
            let width = bind.range_bar.offsetWidth;

            e.preventDefault();

            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', moveEnd);
            
            window.addEventListener('touchmove', move);
            window.addEventListener('touchend', moveEnd);

            bind.slider.className += ' hover';

            function move(e){

                var x_ = e.clientX || e.changedTouches[0].clientX || 0;
                var dif_x = x_ - x;
                
                if( !dif_x ) return;
                
                var width_ = width + dif_x;
                var widthCSS, leftCss;


                if( width_ >= range_bar_box_width ){
                    widthCSS = 1;
                    leftCSS = range_bar_box_width - bind.slider.offsetWidth / 2 ;
                }else if( width_ <= 0 ){
                    widthCSS = 0;
                    leftCSS = -bind.slider.offsetWidth / 2 ;
                }else{
                    widthCSS = width_ / range_bar_box_width;
                    leftCSS = ( width_ - bind.slider.offsetWidth / 2 );
                }

                bind.range_bar.style.width = widthCSS * 100 + '%';
                bind.slider.style.left = leftCSS / range_bar_box_width * 100 + '%';

                setRangeValue(bind);
                
            }

            function moveEnd(){
                window.removeEventListener('mousemove', move);
                window.removeEventListener('mouseup', moveEnd);

                window.removeEventListener('touchmove', move);
                window.removeEventListener('touchend', moveEnd);

                bind.slider.className = bind.slider.className.replace(/(\s+|^)hover\b/, '');

            }

        }

    }


    {

         for( let item in inputs){
 
             if( !inputs.hasOwnProperty(item) ) continue;

            let input = inputs[item].input;
 
             input.value = formatNum( input.value );
             input.addEventListener('input', function(e){ 
                 var input = e.target; 
                 var SelS = input.selectionStart;
                 var SelE = input.selectionEnd;
                 var countSpS = input.value.match(/\s+/g)?.length || 0;

                 setDataValue.call(inputs[item], parseInt( input.value.replace(/\s+/g, '').replace(/,/, '.') ) );
                 
                 if( item == 'summ_cost' ){ 
                    setDataValue.call( inputs.first_payment, parseInt(inputs.first_payment.input.value.replace(/\s+/g,'').replace(/,/,'.')) ) 
                }

                 input.value = formatNum(input.value);
                 var countSpE = input.value.match(/\s+/g)?.length;
                 var countS = countSpE ? input.value.match(/\s+/g)?.length - countSpS : 0;
 
                input.setSelectionRange(SelS+countS,SelE+countS);

                calculate();
             });
         }
 
     }

    
    for(let input in inputs){
        if( !inputs.hasOwnProperty(input) ) continue;
        setDataValue.call( inputs[input] , inputs[input].input.value.replace(/\s+/g, '').replace(/,/, '.') );
    }
        
    calculate();

});

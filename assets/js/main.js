(function ($) {
    "use strict";
    
    new WOW().init();  
    
    /*---background image---*/
	function dataBackgroundImage() {
		$('[data-bgimg]').each(function () {
			var bgImgUrl = $(this).data('bgimg');
			$(this).css({
				'background-image': 'url(' + bgImgUrl + ')', // + meaning concat
			});
		});
    }
    
    $(window).on('load', function () {
        dataBackgroundImage();
    });
    

    /*---stickey menu---*/
    $(window).on('scroll',function() {    
           var scroll = $(window).scrollTop();
           if (scroll < 100) {
            $(".sticky-header").removeClass("sticky");
           }else{
            $(".sticky-header").addClass("sticky");
           }
    });

    // Slick Slider Activation
    var $sliderActvation = $('.slick__activation');
    if($sliderActvation.length > 0){
        $sliderActvation.slick({
          prevArrow:'<button class="prev_arrow"><img src="assets/img/icon/navigation-arrow2.webp" alt=""></button>',
          nextArrow:'<button class="next_arrow"><img src="assets/img/icon/navigation-arrow1.webp" alt=""></button>',
        });
    };

    // Slick Slider Activation2
    var $sliderActvation = $('.slick__activation2');
    if($sliderActvation.length > 0){
        $sliderActvation.slick({
          prevArrow:'<button class="prev_arrow"><i class="icofont-long-arrow-left"></i></button>',
          nextArrow:'<button class="next_arrow"><i class="icofont-long-arrow-right"></i></button>',
        });
    };


    /*--- Magnific Popup Video---*/
    $('.video_popup').magnificPopup({
        type: 'iframe',
        removalDelay: 300,
        mainClass: 'mfp-fade'
    });

    $('.popup_img').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });
    

     /*--- counterup activation ---*/
     $('.counterup').counterUp({
        delay: 20,
        time: 2000
    });
 
    // niceselect activation
    $(document).ready(function() {
      $('select,.select_option').niceSelect();
    });
    
    // Scroll to top
    scrollToTop();

    function scrollToTop() {
        var $scrollUp = $('#scroll-top'),
            $lastScrollTop = 0,
            $window = $(window);

        $window.on('scroll', function () {
            var st = $(this).scrollTop();
            if (st > $lastScrollTop) {
                $scrollUp.removeClass('show');
            } else {
                if ($window.scrollTop() > 200) {
                    $scrollUp.addClass('show');
                } else {
                    $scrollUp.removeClass('show');
                }
            }
            $lastScrollTop = st;
        });

        $scrollUp.on('click', function (evt) {
            $('html, body').animate({scrollTop: 0}, 600);
            evt.preventDefault();
        });
    }
    scrollToTop();


    /*---canvas menu activation---*/
    $('.canvas_open').on('click', function(){
        $('.offcanvas_menu_wrapper,.body_overlay').addClass('active')
    });
    
    $('.canvas_close,.body_overlay').on('click', function(){
        $('.offcanvas_menu_wrapper,.body_overlay').removeClass('active')
    });
    
    /*---Off Canvas Menu---*/
    var $offcanvasNav = $('.offcanvas_main_menu'),
        $offcanvasNavSubMenu = $offcanvasNav.find('.sub-menu');
    $offcanvasNavSubMenu.parent().prepend('<span class="menu-expand"><i class="icofont-simple-down"></i></span>');
    
    $offcanvasNavSubMenu.slideUp();
    
    $offcanvasNav.on('click', 'li a, li .menu-expand', function(e) {
        var $this = $(this);
        if ( ($this.parent().attr('class').match(/\b(menu-item-has-children|has-children|has-sub-menu)\b/)) && ($this.attr('href') === '#' || $this.hasClass('menu-expand')) ) {
            e.preventDefault();
            if ($this.siblings('ul:visible').length){
                $this.siblings('ul').slideUp('slow');
            }else {
                $this.closest('li').siblings('li').find('ul:visible').slideUp('slow');
                $this.siblings('ul').slideDown('slow');
            }
        }
        if( $this.is('a') || $this.is('span') || $this.attr('clas').match(/\b(menu-expand)\b/) ){
        	$this.parent().toggleClass('menu-open');
        }else if( $this.is('li') && $this.attr('class').match(/\b('menu-item-has-children')\b/) ){
        	$this.toggleClass('menu-open');
        }
    });

    $(document).ready(function() {
      console.log(window.location.href)
      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      });
  
      window.token = params.token;
      console.log(window.token);
      if(!window.token){
        $( "#reset_password_invalid_token" ).removeClass('reset_password_invalid_token_hidden');
      }else{
        $( "#reset_password_invalid_token" ).addClass('reset_password_invalid_token_hidden');
      }
  
      window.resetPasswordBtnDisabled = true;
      window.password = '';
      let confirmPassword = '';
      $( "#password" ).keyup(function(e) {
        window.password = e.target.value;
        const resetPasswordBtnDisabled = `
        <div class="reset_password_btn_disabled">
          <a class="btn btn-link" onClick="resetPassword()">Reset Password</a>
        </div>
        `;
        const resetPasswordBtnEnabled = `
        <div class="reset_password_btn">
          <a class="btn btn-link" onClick="resetPassword()">Reset Password</a>
        </div>
        `;
        if(!!confirmPassword && !!window.password){
          if (window.password !== confirmPassword){
            $( "#password" ).addClass('reset_password_input_wrong');
            $( "#confirm-password" ).addClass('reset_password_input_wrong');
            $( "#reset_password_error" ).removeClass('reset_password_error_hidden');
            $('#reset_password_btn').html(resetPasswordBtnDisabled);
            window.resetPasswordBtnDisabled=true;
          } else {
            $( "#password" ).removeClass('reset_password_input_wrong');
            $( "#confirm-password" ).removeClass('reset_password_input_wrong');
            $( "#reset_password_error" ).addClass('reset_password_error_hidden');
            if(!!window.token){
              $('#reset_password_btn').html(resetPasswordBtnEnabled);
              window.resetPasswordBtnDisabled=false;
            }
            
          }
        }
      });
  
      $( "#confirm-password" ).keyup(function(e) {
        confirmPassword = e.target.value;
        const resetPasswordBtnDisabled = `
        <div class="reset_password_btn_disabled">
          <a class="btn btn-link" onClick="resetPassword()">Reset Password</a>
        </div>
        `;
        const resetPasswordBtnEnabled = `
        <div class="reset_password_btn">
          <a class="btn btn-link" onClick="resetPassword()">Reset Password</a>
        </div>
        `;
        if(!!confirmPassword && !!window.password){
          if ( window.password !== confirmPassword){
            $( "#password" ).addClass('reset_password_input_wrong');
            $( "#confirm-password" ).addClass('reset_password_input_wrong');
            $( "#reset_password_error" ).removeClass('reset_password_error_hidden');
            $('#reset_password_btn').html(resetPasswordBtnDisabled);
            window.resetPasswordBtnDisabled=true;
          } else {
            $( "#password" ).removeClass('reset_password_input_wrong');
            $( "#confirm-password" ).removeClass('reset_password_input_wrong');
            $( "#reset_password_error" ).addClass('reset_password_error_hidden');
            if(!!window.token){
              $('#reset_password_btn').html(resetPasswordBtnEnabled);
              window.resetPasswordBtnDisabled=false;
            }
          }
        }
      });
    });
  
})(jQuery);	

window.putAsync = async function(url, data) {
  return await fetch(url, {method: "PUT", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)});
}

window.resetPassword = async function(){
  if(window.resetPasswordBtnDisabled) return;
  const response = await window.putAsync(`https://beta-api.moonscapegame.com/password-recovery/set-password`,{token: window.token, password:window.password});
  console.log('response: ', response)
  const json = await response.json();
  console.log('json: ', json)
  if (json.status === 200){
    $("#reset_password_success").removeClass('reset_password_success_hidden');
    window.resetPasswordBtnDisabled = true;
    const resetPasswordBtnDisabled = `
    <div class="reset_password_btn_disabled">
      <a class="btn btn-link" onClick="resetPassword()">Reset Password</a>
    </div>
    `;
    $('#reset_password_btn').html(resetPasswordBtnDisabled);
  } else {
    $("#reset_password_fail").removeClass('reset_password_fail_hidden');
  }
}
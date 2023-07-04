if (!(location.hostname === 'videocamera.kz' || location.hostname === 'dev.videocamera.kz')) {
    console.log('Go redir');
    // location.href="https://videocamera.kz" + document.location.pathname;
}
(function($) {

    var methods = {
        init: function(options) {
            console.log('Lb::init;');
            methods.show(this);
            $(document)
                .on('click', '.imp-lightbox__overlay', function(e) {
                    methods.hide();
                })
                .on('click', '.imp-lightbox__close', function(e) {
                    methods.hide();
                });
        },
        show: function(el) {
            console.log('Lb::show;');
            var lightbox = $('.imp-lightbox'),
                bodyHeight = parseInt($('body').height()),
                triggerName = el.data('impLightboxTrigger');
            if (!lightbox.length) {
                methods.draw();
            } else {
                $(lightbox).removeClass('hide');
            }
            $('.imp-lightbox__overlay').height(bodyHeight + 'px');
            methods.center($('.imp-lightbox__wrapper'));
            if (triggerName && imp.lightbox[triggerName]) {
                methods.work(imp.lightbox[triggerName]);
            }
        },
        hide: function() {
            $('.imp-lightbox').addClass('hide');
        },
        draw: function() {
            $('body').append('<div class="imp-lightbox"><div class="imp-lightbox__overlay"></div><div class="imp-lightbox__wrapper"><div class="imp-lightbox__content loader"></div><div class="imp-lightbox__close"></div></div></div>');
        },
        work: function(triggerParams) {
            switch (triggerParams.type) {
                case 'ajax':
                    methods.workAjax(triggerParams);
                    break;
            }
        },
        workAjax: function(triggerParams) {
            console.log('workAjax');
            $.ajax({
                    url: triggerParams.url,
                    type: triggerParams.type,
                    cache: false
                })
                .done(function(html) {
                    $('.imp-lightbox__content').html($(html));
                    $('.imp-lightbox').removeClass('hide');
                    setTimeout(function() {
                        methods.center($('.imp-lightbox__wrapper'));
                    }, 200);
                });
        },
        center: function(element) {
            element.css("position", "absolute");
            var posY = Math.max(30, (($(window).height() - $(element).outerHeight()) / 2) + $(window).scrollTop());
            console.log($(window).height());
            console.log($(element).outerHeight());
            console.log($(window).scrollTop());
            console.log('posY: ' + posY);
            element.css("top", posY + "px");
            element.css("left", Math.max(0, (($(window).width() - $(element).outerWidth()) / 2) + $(window).scrollLeft()) + "px");
            return element;
        }
    };
    $.fn.impLightbox = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.tooltip');
        }
    };
})(jQuery);

let validForm = false;

var camfor = {
        common: {
            setLoader: function(element) {
                $(element).addClass('blur');
            },
            removeLoader: function(element) {
                $(element).removeClass('blur');
            },
        },
        user: {
            askCall: function(element) {
                var valid = camfor.user.askCallValidate(element);

                if (valid) {
                    var data = {
                        'name': $(element).find('.call-us__name').val(),
                        'phone': $(element).find('.call-us__number').val(),
                        'agree': true,
                        'new': $(element).find('.call-us__new').val()
                    };

                    console.log('sending to recall: ');
                    console.log(data);
                    grecaptcha.ready(function() {
                        grecaptcha.execute(
                            '6LfcH1gkAAAAADrwmNO3FQzMGiPmjiecTdJ7n3IR', {
                                action: 'submit'
                            }
                        ).then(function(token) {
                            data.recaptchaToken = token;
                            $.post('/recall', data, function(data) {
                                $(element).replaceWith(data);
                            });
                        });
                    });


                    return;
                }
            },
            askCallValidate: function(element) {
                console.log('Validating');
                valid = false,
                    el = $(element).parents('.call-us').first(),
                    phone = el.find('.call-us__number').first(),
                    phoneRegexp = /\d+/;

                if (/\d.*?\d.*?\d.*?\d.*?\d.*?\d.*?\d.*?\d.*?\d.*?\d.*?\d.*?/.test(phone.val())) {
                    phone.css('background-color', '#fff');
                    valid = true;
                } else {
                    phone.css('background-color', '#fbb');
                    valid = false;
                }
                if (valid) {
                    valid = true;
                } else {
                    valid = false;
                }

                if (valid) {
                    $(el).find('.form-block_button').removeClass('btn-disabled');
                } else {
                    $(el).find('.form-block_button').addClass('btn-disabled');
                }

                if (valid) {
                    console.log('Validating: yes');
                } else {
                    console.log('Validating: NO');
                }
                return valid;
            }
        }
    },
    imp = {
        lightbox: {
            orderForm: {
                type: 'ajax',
                method: 'get',
                'url': '/order_form'
            },
            open: false,
        }
    }
$(document).ready(function() {
    $('.main_banner---new__container').slick({
        autoplay: true,
        speed: 300,
        prevArrow: ".main_banner .main_banner__left-arrow",
        nextArrow: ".main_banner .main_banner__right-arrow",
        responsive: [{
            breakpoint: 767,
            settings: {
                arrows: false,
                dots: false
            }
        }]
    });
    const masksOptions = {
        phone: {
          mask: '+{7} (000) 000-00-00'
        }
      };
    const phoneMask = document.getElementById('phone_mask_input');
    const mask = new IMask(phoneMask, masksOptions.phone);
    
    $(document)
        .on('submit', '.js-user-ask-call', function(e) {
            e.preventDefault();
            const form = document.getElementById('form_request');
            const formData = new FormData(form);
            formData.set('phone', '+' + mask.unmaskedValue);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            if (valid) {
                fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
        .catch(error => {
            console.log(error);
        })
        .then(function() {
            form.reset();
            $('.call-us__sign').addClass('visible');
            $('.form-caption').addClass('hidden');
            $('.form-block_inputs').addClass('hidden');
            $('.form-caption').addClass('hidden');
        });
            }
        })
        .on('click', '[data-imp-lightbox-trigger]', function(e) {
            $('[data-imp-lightbox-trigger]').impLightbox();
            console.log('Lb');
        })
        .on('submit', '.cf-form-order__box form', function(e) {
            var postData = {};
            $(this).find('input, select, textarea').each(function() {
                var name = $(this).attr('name'),
                    val = $(this).val();

                if (this.tagName == 'INPUT' && $(this).attr('type') == 'checkbox') {
                    if (!$(this).is(":checked")) {
                        val = '';
                    }

                }
                postData[name] = val;
            });
            console.log(postData);
            if (postData['agree']) {
                grecaptcha.ready(function() {
                    grecaptcha.execute(
                        '6LfcH1gkAAAAADrwmNO3FQzMGiPmjiecTdJ7n3IR', {
                            action: 'submit'
                        }
                    ).then(function(token) {
                        postData.recaptchaToken = token;
                        $.post("/order_form", postData).done(function(html) {
                            $('.imp-lightbox__content').html($(html));
                        });
                    });
                });
            } else {
                $('#cf-order-popup__submit').prop('disabled');
            }
            e.preventDefault();
        })
        .on('click', '.feedback---new-add', function(e) {
            $('.feedback---new-form_wrapper').css('display', 'block');
        })
        .on('submit', '.feedback---new-form', function(e) {
            var postData = {};
            $(this).find('input, select, textarea').each(function() {
                var name = $(this).attr('name'),
                    val = $(this).val();

                if (this.tagName == 'INPUT' && $(this).attr('type') == 'checkbox') {
                    if (!$(this).is(":checked")) {
                        val = '';
                    }
                }
                postData[name] = val;
            });
            console.log(postData);
            $.post("/feedback/create", postData).success(function() {
                $('.feedback---new-form_wrapper').html('<p>Спасибо за ваш отзыв!</p>');
            });
            setTimeout(function() {
                $('.feedback---new-form_wrapper').html('<p>Спасибо за ваш отзыв!</p>');
                $('.feedback---new-form_wrapper').css('display', 'none');
            }, 1200);
            e.preventDefault();
        })
        .on('change', '#cf-order-popup__agree', function(e) {
            var element = e.target;
            if ($(element).is(":checked")) {
                $('#cf-order-popup__submit').removeProp('disabled');
                $('#cf-order-popup__submit').removeClass('btn-disabled');
            } else {
                $('#cf-order-popup__submit').prop('disabled');
                $('#cf-order-popup__submit').addClass('btn-disabled');
            }
        })
        .on('change input', '.call-us input', function(e) {
            var element = e.target;
            camfor.user.askCallValidate(element);
        })
        .on('click', '.js-cf-product__tab-button', function(e) {
            var element = e.target,
                buttonBox = $(element).parent(),
                index = $(this).index();
            $('.js-cf-product__tab-button').removeClass('js-cf-product__tab-button__active');
            $('.js-cf-product__tab').removeClass('js-cf-product__tab__active');
            $('.js-cf-product__tab').eq(index).addClass('js-cf-product__tab__active');
            $(element).addClass('js-cf-product__tab-button__active');
            e.preventDefault();
            e.stopPropagation();
        });

    $('.portfolio-view__image').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: true,
        centerMode: true,
        focusOnSelect: true,
        variableWidth: true
    });

    $('.block-type-new-disain__wrapper').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: true,
        centerMode: true,
        focusOnSelect: true,
        variableWidth: true
    });

    $('.index-portfolio .portfolio-tiles').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: true,
        centerMode: true,
        focusOnSelect: true,
        variableWidth: true,
        pauseOnHover: true,
        autoplay: true
    });
    $('.portfolio-slider__tiles').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: true,
        centerMode: true,
        focusOnSelect: true,
        variableWidth: true,
        pauseOnHover: true,
        autoplay: true
    });

    $('.portfolio-slider---new-wrapper ul').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 3,
        dots: false,
        arrows: true,
        responsive: [{
            breakpoint: 1000,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 2
            }
        }, {
            breakpoint: 600,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: true,
                arrow: false
            }
        }]
    });


    $('.feedback---new-wrapper ul').slick({
        dots: true,
        centerPadding: '10%',
        arrow: true
    });

    $('.solution-slider_small ul').slick({
        slidesToShow: 2,
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        centerMode: true,
        focusOnSelect: true,
        variableWidth: true
    });

    $('.topmenu--adaptive .hamburger').click(function(e) {
        $('.adaptive__hamburger').toggleClass('adaptive__hamburger--active');
        e.stopPropagation();
        e.preventDefault();
    });
    $('body, .adaptive__hamburger__close').click(function() {
        $('.adaptive__hamburger').removeClass('adaptive__hamburger--active');

    });
    $('#nav-icon3').click(function() {
        $(this).toggleClass('open');
    });
    $('.top-menu---new_burger-button').click(function() {
        $('.burger-menu').toggleClass('burger-menu-active')
    });
    $('.scheme-working---new-img_1').hover(function() {
        $('.scheme-working---new-text_p').removeClass('scheme-working---new-text_display-block')
        $('.scheme-working---new-text_1').addClass('scheme-working---new-text_display-block')
    });
    $('.scheme-working---new-img_2').hover(function() {
        $('.scheme-working---new-text_p').removeClass('scheme-working---new-text_display-block')
        $('.scheme-working---new-text_2').addClass('scheme-working---new-text_display-block')
    });
    $('.scheme-working---new-img_3').hover(function() {
        $('.scheme-working---new-text_p').removeClass('scheme-working---new-text_display-block')
        $('.scheme-working---new-text_3').addClass('scheme-working---new-text_display-block')
    });
    $('.scheme-working---new-img_4').hover(function() {
        $('.scheme-working---new-text_p').removeClass('scheme-working---new-text_display-block')
        $('.scheme-working---new-text_4').addClass('scheme-working---new-text_display-block')
    });
});
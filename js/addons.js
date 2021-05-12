  $(document).ready(function(){
    $('.list').click(function(){
        const value = $(this).attr('data-filter');
        if (value == 'all'){
            $('.itemBox').show('9');
        }
        else{
            $('.itemBox').not('.'+value).hide('9')
            $('.itemBox').filter('.'+value).show('9')
        }
    })
    $('.list').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
    })

});

window.addEventListener('scroll', function(){
  var scroll = document.querySelector('.scrollTop');
  scroll.classList.toggle('active', window.scrollY > 300)
});

function scrollToTop(){
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
};




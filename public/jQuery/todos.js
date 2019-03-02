
//Shutting down enter ket
$("input").keydown(function (e) {
	if (e.keyCode == 13) {
	  e.preventDefault();
	}
  });




//Toggling input field
$(".fa-pencil-square-o").click(function(){$("input[type='text'").fadeToggle();$("input[type='submit'").fadeToggle(); })



$(document).ready(function(){
	$('.custom-file-input').on('change', function() { 
		let fileName = $(this).val().split('\\').pop(); 
		$(this).next('.custom-file-control').addClass("selected").html(this.files.length + " files"); 
		    
	});
})
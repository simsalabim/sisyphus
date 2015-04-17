/*
  Save and Restore on demmand.
  Usage:
  1 - Include this file and the base sisyphus script file.
				<script type="text/javascript" src="/js/sisyphus/sisyphus.js"></script>
				<script type="text/javascript" src="/js/ondemmand_sisyphus.js"></script>

  2 - Use the following code for starting up sisyphus:
        <script type="text/javascript">
					$(document).ready(function(){
						attachSisyphus("#formu")
					});
				</script>
				
	3 - Invoke save_sisyphus() after validation but before form submission.
	      save_sisyphus('#formu');
	      
	4 - Include the following button to restore on demmand:
	    <input class="encBoton" style="text-align: right;" value="Restaurar Respuestas Recientemente Guardadas" onclick="restore_last_saved_values('#formu');" type="button">
*/

function attachSisyphus(objSel)
{
	$(objSel).sisyphus({
		timeout: 0,
		autoRelease: false,
		locationBased: true,
		onBeforeRestore: function() {return false;},
		onBeforeSave: function() {return false;}
	});
}

function save_sisyphus(objSel) {
	var s = $(objSel).sisyphus();

	// Allow to save keeping old behaviour.
	var original_behaviour = s.options.onBeforeSave;
	s.options.onBeforeSave = function(){return true;}

	// Save and restore original behaviour
	s.saveAllData();
	s.options.onBeforeSave = original_behaviour;
	return true;
};

function restore_last_saved_values(objSel){
	c = confirm("You are about to restore your data.\nDo you want to continue?");
	if (!c) return false;

	$(objSel).sisyphus().restoreAllData();
	alert('Your data has been restored.');
	return true;
}

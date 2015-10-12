(function ($) {
  $(function() {
    $('body').delegate('[data-fid]', 'mouseup', function() {
      var fid = $(this).attr('data-fid');
      var url = '/file/' + fid + '/dlcounter';
      $.ajax({ 
        url: url,
        success: function(data, textStatus, jqXHR) {
          console.log(data);
          $('span#dlcount-' + fid).html(data.dlcount);
        }
      });
      return true;
    });
  });
})(jQuery);;
jQuery(document).ready(function() {
  var groupClasses = new Array();
  jQuery('.search-result.solr-grouped').each(function(index, item){
    item = jQuery(item)
    currentGroupClass = item.attr('class').substr(item.attr('class').lastIndexOf('solr-group-'));
    if(jQuery.inArray(currentGroupClass, groupClasses) < 0) {
      groupClasses.push(currentGroupClass);
    }
  });

  jQuery.each(groupClasses, function(index, item) {
    currentGroup = jQuery('.search-result.solr-grouped.' + item);
    currentGroup.wrapAll('<li id="' + item + '-all" />');
    currentGroup.wrapAll('<ol class="apachesolr_search-results-grouped search-results-grouped">');
    jQuery('#' + item + '-all').prepend('<span>Group: ' + item.replace('solr-group-', '') +'</span>');
  });
});
;

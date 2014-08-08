var BS = (function(my, $)
{
    var storage = $.localStorage;

    my.init = function()
    {
        //setup event handlers here
        $(".add-game-xml").click(BS.openGameAddXMLPopup);
        $("#xml_file").on("change", BS.handleFileSelect);

        my.populateCachedGameSystems();
    };

    my.populateCachedGameSystems = function()
    {
        var lsGamseSystems = my.localGet("game_systems");

        if (lsGamseSystems !== null &&
            lsGamseSystems.length >= 1)
        {
            $.each(lsGamseSystems, function(i, v)
            {
                my.addGameSystemToDisplay(v);
            });
        }
    };

    my.openGameAddXMLPopup = function(e)
    {
        e.preventDefault();
        var dataType = $(this).attr("data-type");

        $("#game-xml").popup(
        {
            beforeposition: function(event, ui)
            {
                $("#xml-data-type").attr("value", dataType);
            }
        })
        $("#game-xml").popup("open");
    };

    my.handleFileSelect = function(e)
    {
        var file = e.target.files[0]; // FileList object

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile)
        {
            return function(e)
            {
                var xmlDoc = $.parseXML(e.target.result);
                var $xml = $(xmlDoc);

                var gs = $xml.find("gameSystem");

                if (my.validateGameSystem($xml) === true)
                {
                    var gsObj = {
                        "id": gs.attr("id"),
                        "name": gs.attr("name")
                    };

                    var lsGamseSystems = my.localGet("game_systems");
                    var dupe = false;

                    if (lsGamseSystems !== null &&
                        lsGamseSystems.length >= 1)
                    {
                        $.each(lsGamseSystems, function(i, v)
                        {
                            if (v["id"] == gs.attr("id")) dupe = true;
                        });
                    }

                    if (dupe === false)
                    {
                        if (typeof(lsGamseSystems) != "array")
                        {
                            lsGamseSystems = [];
                        }

                        lsGamseSystems.push(gsObj);
                        my.addGameSystemToDisplay(gsObj);
                    }

                    my.localSet("game_systems", lsGamseSystems);

                    console.log("dupe", dupe);
                    $("#game-xml").popup("close");
                }
            };
        })(file);

        reader.readAsBinaryString(file);
    };

    my.addGameSystemToDisplay = function(gs)
    {
        var input = $("<input />").attr(
        {
            "type": "radio",
            "name": "game-system-choice",
            "value": gs["id"],
            "id": gs["id"]
        });

        var label = $("<label />").attr(
        {
            "for": gs["id"]
        }).text(gs["name"]);

        $("#loaded-game-systems").append(input);
        $("#loaded-game-systems").append(label);
        $("#loaded-game-systems").trigger('create');
    };

    my.validateGameSystem = function($xml)
    {
        return true;
    };

    my.localSet = function(key, value)
    {
        return storage.set(key, value);
    };

    my.localGet = function(key)
    {
        return storage.get(key);
    };

    my.localRemove = function(key)
    {
        return storage.remove(key);
    };

    return my;
}(BS ||
{}, jQuery));

$(document).ready(BS.init);
var BS = (function(my, $)
{
    var storage = $.localStorage;

    my.init = function()
    {
        //my.localRemove("game_systems");

        //setup event handlers here
        $(".add-game-xml").click(BS.openGameAddXMLPopup);
        $("#xml_file").on("change", BS.handleFileSelect);

        my.populateCachedGameSystems();
    };

    my.populateCachedGameSystems = function()
    {
        var lsGamesSystems = my.localGet("game_systems");

        if (lsGamesSystems !== null &&
            Object.size(lsGamesSystems) >= 1)
        {
            $("#no-game-systems").hide();
            for (var id in lsGamesSystems)
            {
                my.addGameSystemToDisplay(lsGamesSystems[id]);
            }
        }
    };

    my.openGameAddXMLPopup = function(e)
    {
        e.preventDefault();
        var dataType = $(this).attr("data-type");

        $('#add-game-xml-form').each(function()
        {
            this.reset();
        });

        $("#game-xml").popup(
        {
            beforeposition: function(event, ui)
            {
                $("#xml-data-type").attr("value", dataType);
            }
        });
        $("#game-xml").popup("open");
    };

    my.handleFileSelect = function(e)
    {
        var file = e.target.files[0];

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile)
        {
            return function(e)
            {
                var xmlDoc = $.parseXML(e.target.result);
                var $xml = $(xmlDoc);

                var type = $("#xml-data-type").attr("value");

                switch (type)
                {
                    case "game":
                        my.processNewGameSystem($xml, e.target.result);
                        break;
                    case "force":
                        my.processNewForce($xml, e.target.result);
                        break;
                }

                $("#game-xml").popup("close");
            };
        })(file);

        reader.readAsBinaryString(file);
    };

    my.processNewForce = function($xml, xmlDoc)
    {
        var cat = $xml.find("catalogue");

        if (my.validateForce($xml) === true)
        {
            var fObj = {
                "id": cat.attr("id"),
                "gsid": cat.attr("gameSystemId"),
                "name": cat.attr("name"),
                "xml": xmlDoc
            };

            var lsForces = my.localGet("game_forcess");
            var dupe = false;

            if (lsForces !== null &&
                lsForces.hasOwnProperty(cat.attr("id")))
            {
                dupe = true;
                console.log("Dupe force found");
            }
            else
            {
                lsForces = {};
            }

            if (dupe === false)
            {
                lsForces[cat.attr("id")] = fObj;
                // my.addForceToDisplay(gsObj);
                // $("#no-game-systems").hide();
                my.localSet("game_forcess", lsForces);
            }
        }
    };

    my.processNewGameSystem = function($xml, xmlDoc)
    {
        var gs = $xml.find("gameSystem");

        if (my.validateGameSystem($xml) === true)
        {
            var gsObj = {
                "id": gs.attr("id"),
                "name": gs.attr("name"),
                "xml": xmlDoc
            };

            var lsGamesSystems = my.localGet("game_systems");
            var dupe = false;

            if (lsGamesSystems !== null &&
                lsGamesSystems.hasOwnProperty(gs.attr("id")))
            {
                dupe = true;
            }
            else
            {
                lsGamesSystems = {};
            }

            if (dupe === false)
            {
                lsGamesSystems[gs.attr("id")] = gsObj;
                my.addGameSystemToDisplay(gsObj);
                $("#no-game-systems").hide();
                my.localSet("game_systems", lsGamesSystems);
            }
        }
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

        var delBtn = $("<a />").attr(
        {
            "href": "#",
            "data-id": gs["id"]
        }).addClass("rem-game-system ui-shadow ui-btn ui-corner-all ui-btn-inline ui-icon-delete ui-btn-icon-notext ui-btn-a ui-mini").text("icon only button");

        delBtn.click(function(e)
        {
            my.removeGameSystem(this);
        });

        label.append(delBtn);
        $("#cached-game-systems").append(input);
        $("#cached-game-systems").append(label);
        $("#loaded-game-systems").trigger('create');
    };

    my.removeGameSystem = function(obj)
    {
        var id = $(obj).attr("data-id");

        var lsGamesSystems = my.localGet("game_systems");

        if (lsGamesSystems === null)
        {
            $("#no-game-systems").show();
            return;
        }

        if (lsGamesSystems.hasOwnProperty(id))
        {
            delete lsGamesSystems[id];
        }

        if (Object.size(lsGamesSystems) <= 0)
        {
            $("#no-game-systems").show();
        }

        my.localSet("game_systems", lsGamesSystems);

        $("#cached-game-systems").html("");
        my.populateCachedGameSystems();
    };

    my.validateForce = function($xml)
    {
        return true;
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

Object.size = function(obj)
{
    var size = 0,
        key;
    for (key in obj)
    {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

$(document).ready(BS.init);
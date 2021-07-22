// Tittle
const commandResult = document.getElementById("result")
const autotierVersion = document.getElementById("version")

// Conflicts
const conflict = document.getElementById("conflict")

// Combined
const combinedPath = document.getElementById("combinedPath")
const combinedCapacity = document.getElementById("combinedCapacity")
const combinedQuota = document.getElementById("combinedQuota")
const progressBar = document.getElementById("progressbar")
const combinedPercent = document.getElementById("percent")
const combinedError = document.getElementById("combinedError")
const showBar = document.getElementById("show-percent")

// Tier
const tierDiv = document.getElementById("tiers")
const tiersError = document.getElementById("tiersError")

const button = document.getElementById("button")
button.addEventListener("click", execute)

execute() // Start as page is refreshed

// Execute command and pass to output function
function execute() {
    clear_display()
    cockpit.spawn(["autotier", "status", "--json"])
        .done(parse_string)
        .fail(status_fail)
}

// Clear existing data
function clear_display() {
    commandResult.style.color = ""
    conflict.innerHTML = ""
    commandResult.innerHTML = ""
    autotierVersion.innerHTML = ""
    combinedPath.innerHTML = ""
    combinedQuota.innerHTML = ""
    combinedCapacity.innerHTML = ""
    tierDiv.innerHTML = ""
}

// If command was successful
function status_success() {
    commandResult.style.color = "green"
    commandResult.innerHTML = "Success"
}

// If command failed
function status_fail(data) {
    commandResult.style.color = "red"
    commandResult.innerHTML = "Failed<p>Autotier status Did not work!<br/>ERROR Code: " + data + "</p>"
}

// Turn string from command into a JSON object
function parse_string(data) {
    // make a JSON object
    status_success() // display success
    try {
        var outputJson = JSON.parse(data)
        display(outputJson)
    }
    catch(err) // Catch and display error message
    {
        commandResult.innerHTML = "<p class=\"error-message\">ERROR: cannot read 'autotier status' JSON File<br/>This version of autotier status is likely outdated. Please check for updates.</p>"
        combinedError.innerHTML = ""
        tiersError.innerHTML = ""
    }
}

// Display JSON Object
function display(obj) {
    // Try to retrive version from JSON
    if(obj.version != undefined) {
        displayVersion("Autotier Version: " + obj.version)
    } else {
        displayVersion("ERROR: Could not find Autotier version...")
    }

    // Try to retirve conflicts
    if(obj.conflicts != undefined)
    {
        if(obj.conflicts.has_conflicts == true)
        {
            displayConflicts(obj.conflicts.paths)
        }
    } else {
        conflict.innerHTML = "<article class=\"pf-c-card\"><div class=\"pf-c-card__header\"><div class=\"pf-c-card__title\"><h2>Conflicts</h2></div></div><div class=\"pf-c-card__body error-message\"><p class=\"error-message\">ERROR: Could not find 'conflicts' section in 'autotier status' json file...<br />The current verison of Autotier Status is likely outdated from autotier. Please check for updates.</p></div></article>"
    }

    // Try to retirve combined
    if(obj.combined != undefined) {
        displayCombined(obj.combined)
    } else {
        combinedError.innerHTML = "<p class=\"error-message\">ERROR: Could not find 'combined' section in 'autotier status' json file...<br />The current verison of Autotier Status is likely outdated from autotier. Please check for updates.</p>"
    }

    // Try to retirve tiers
    if(obj.tiers != undefined) {
        displayTiers(obj.tiers)
    } else {
        tiersError.innerHTML = "<p class=\"error-message\">ERROR: Could not find 'tiers' section in 'autotier status' json file...<br />The current verison of Autotier Status is likely outdated from autotier. Please check for updates.</p>"
    }

}

// Display Autotier version
function displayVersion(version) {
    autotierVersion.innerHTML = version
}

// Display conflicts if any
function displayConflicts(paths) {
    // Begining html string
    var htmlString = "<article class=\"pf-c-card\"><div class=\"pf-c-card__header\"><div class=\"pf-c-card__title\"><h2>Conflicts</h2></div></div><div class=\"pf-c-card__body\"><p>Oh no! You have duplicate files in the following path: </p><br /><ul>"

    // Add lists of conflicting paths
    for (var items in paths) {
        htmlString += "<li class=\"bold-text\">" + paths[items] + "</li>"
    }

    // Add end of html string
    htmlString += "</ul><br /><p>Do not worry, these files have been renamed to avoid overwriting...</p></div></article>"
    // add html to page
    conflict.innerHTML = htmlString
}

// Display Combined
function displayCombined(combined) {
    var percentage = createPercentage(combined.usage,combined.quota)

    combinedPath.innerHTML = combined.path
    combinedCapacity.innerHTML = combined.capacity_pretty
    combinedQuota.innerHTML = combined.usage_pretty + " / " + combined.quota_pretty

    // Check what percent is at... if higher than 6 show inside bar.
    if(parseInt(percentage.slice(0, -1)) >= 7)
    {
        combinedPercent.innerHTML = percentage
        showBar.classList.add("pf-m-inside")
    }
    progressBar.style.width = percentage // Set bar width
}

// Display tiers
function displayTiers(tierList) {
    var htmlString = ""

    var percentage = []
    var ids = []
    var name = ""
    var path = ""
    var capacity = ""
    var usage = ""
    var quota = ""

    // Sort through each tier
    for (var tiers in tierList) {
        // Get variables needed from each tier
        name = tierList[tiers].name
        path = tierList[tiers].path
        capacity = tierList[tiers].capacity_pretty
        usage = tierList[tiers].usage_pretty
        quota = tierList[tiers].quota_pretty
        percentage[tiers] = createPercentage(tierList[tiers].usage, tierList[tiers].quota)
        ids[tiers] = name

        // Create big <tr></tr> with said variables. Add it onto the pervious created <tr></tr>
        htmlString += createTier(name, path, capacity, usage, quota, percentage[tiers], ids[tiers])
    }

    // Add it to the tier(s) table
    tierDiv.innerHTML = htmlString

    // Add percentages to bar
    for (var tiers in tierList) {
        document.getElementById(ids[tiers]).style.width = percentage[tiers] // set bar width
    }
}

// html skeleton for a tier entry
function createTier(name, path, capacity, usage, quota, percentage, id) {
    // Check what percent is at... if higher than 6 show inside bar.
    if(parseInt(percentage.slice(0, -1)) >= 7)
    {
        return "<tr><td>" + name + "</td><td>" + path + "</td><td>" + capacity + "</td><td><div class=\"pf-c-progress pf-m-inside pf-m-singleline\"><div class=\"pf-c-progress__status\"><span>" + usage + " / " + quota + "</span></div><div class=\"pf-c-progress__bar\"><div class=\"pf-c-progress__indicator\" id=\"" + id + "\"><span class=\"pf-c-progress__measure\">" + percentage + "</span></div></div></div></td></tr>"
    }
    else {
        return "<tr><td>" + name + "</td><td>" + path + "</td><td>" + capacity + "</td><td><div class=\"pf-c-progress pf-m-singleline\"><div class=\"pf-c-progress__status\"><span>" + usage + " / " + quota + "</span></div><div class=\"pf-c-progress__bar\"><div class=\"pf-c-progress__indicator\" id=\"" + id + "\"><span class=\"pf-c-progress__measure\"></span></div></div></div></td></tr>"
    }
}

// Take usage and quote and turn into a percentage
function createPercentage(usage, quota) {
    return Math.round((usage/quota) * 100) + "%"
}
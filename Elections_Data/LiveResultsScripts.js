// ElectionNightResults v2.5.3.0
// LiveResultsScripts.js v1.1.0

// Check for and make sure we have jQuery included.
if (typeof jQuery === 'undefined') {
    console.error('LiveResults requires jQuery to function properly. Please include jQuery before including LiveResultsScripts.js');
}

// Check for if the user is viewing this page from a mobile device (screen width < 700px).
//if (screen.width < 700 && !document.location.search.includes('force') && !document.location.pathname.includes('Mobi')) {
//    var path = document.location.pathname;
//    var regex = /Index_(\d+)(_New)?\.html/i;
//    var match = path.match(regex);
//    var electionID = match[1];
//    var isNew = match[2];

//    path = path.substring(0, path.lastIndexOf('/') + 1);

//    var url = document.location.protocol + '//' + document.location.host;
//    url += path;

//    if (typeof isNew === 'undefined') {
//        isNew = '';
//    }

//    document.location = url + 'Mobi_' + electionID + isNew + '.html';
//}

// Global variable declarations used by this web page.
var __seconds = 0;
var __minutes = 0;
var __currentFocus;
var __isMobile = 'false';
var __didScroll = false;
var __maxHeight = 0;
var __lazyLoadInit = false;
var __tableLoadInit = false;
var __delay = 0;
var __speed = 0;

/*************************\
  Function declarations.
\*************************/

// Returns whether all of the contests have been selected from the filter list.
function AllRacesChecked() {
    var allChecked = true;

    $('#modalArea').find('input[type="checkbox"]').each(function (idx, elem) {
        if (!$(elem).prop('checked')) {
            allChecked = false;
            return false;
        }
    });

    return allChecked;
}

function AllGroupRacesChecked(groupId) {
    var allChecked = true;

    $('#modalArea input[type="checkbox"][data-race][data-group="' + groupId + '"]').each(function (idx, elem) {
        if (!$(elem).prop('checked')) {
            allChecked = false;
            return false;
        }
    });

    return allChecked;
}

// Returns the time in milliseconds that the cycle should delay for between transitions.
function CalculateTimeout(currElement, nextElement, opts, isForward) {
    var idx = currElement.id;
    var intMinDisTime = GetMinimumDisplayTime();
    var intTimePerCandidate = GetTimePerCandidate();
    var freq = 4;

    if (freq < intMinDisTime) {
        freq = intMinDisTime;
    }

    return freq * 1000;
}

// Expands or collapses the contest contents on the summary view.
function ExpandCollapse(element) {
    var $this = $(element);
    $this.next('.content').slideToggle();

    if ($this.attr('aria-expanded') === 'false') {
        $this.attr('aria-expanded', 'true');
    } else {
        $this.attr('aria-expanded', 'false');
    }

    var $icon = $this.find('.far');
    $icon.toggleClass('fa-minus-square fa-plus-square');
}

// Print the current page.
function PrintDivData() {
    window.print();
}

var ViewMode = "Default";

// Show or hide the pie charts depending on the mode parameter passed.
var counternum = 0;
var counternum2 = 0;
function ToggleGraphs(mode) {
    window.sessionStorage.setItem('viewmode', mode);

    // Unhighlight all menu buttons.
    $('#lnkPanelMode').attr('class', 'menu-button');
    $('#lnkPieMode').attr('class', 'menu-button');
    $('#lnkTableMode').attr('class', 'menu-button');

    var displayMode = window.sessionStorage.getItem('displayMode');

    if (mode === 'pie') {
        if (!__lazyLoadInit) {
            __lazyLoadInit = true;
            var $loadingPanel = $('#loadingPanel');
            $loadingPanel.find('#loadingPanelText').text('Initializing charts...');
            $loadingPanel.css('display', 'flex');

            var p = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    $('.lazy').lazyload({
                        threshold: 200,
                        load: function (p) {
                            if (window.sessionStorage.getItem('viewmode') === 'pie') {
                                p.show();
                            } else {
                                p.hide();
                            }
                        },
                        trigger: 'appear touchstart'
                    });

                    $.lazyload.setInterval(100);

                    resolve();
                }, 1);
            });

            p.then(function () {
                $loadingPanel.css('display', '');
            });
        }

        // Highlight selected menu button.
        $('#lnkPieMode').addClass('selected');
        $('.pie-results').css('display', 'block');

        ViewMode = "Pie";

        // Hide all of the data tables.
        $('.table-results').css('display', 'none');
        $('.detials-results').css('display', 'none');
        $.lazyload.refresh('.lazy');

    } else if (mode === 'none') {
        // Highlight selected menu button.
        $('#lnkPanelMode').addClass('selected');
        $('.table-results').css('display', 'block');

        ViewMode = "Default";

        // Hide all of the pie charts.
        $('.pie-results').css('display', 'none');
        $('.detials-results').css('display', 'none');
    } else if (mode === 'table') {
        if (counternum == 0) {
            counternum = counternum + 1;
        }
        
        if (!__tableLoadInit) {
            __tableLoadInit = true;
            var $loadingPanel = $('#loadingPanel');
            $loadingPanel.find('#loadingPanelText').text('Initializing tables...');
            $loadingPanel.css('display', 'flex');

            var p = new Promise(function (resolve, reject) {
                setTimeout(function () {
                    $('.lazyTable').lazyload({
                        threshold: 200,
                        load: function (p) {
                            if (window.sessionStorage.getItem('viewmode') === 'table') {
                                p.show();
                            } else {
                                p.hide();
                            }
                        },
                        trigger: 'appear touchstart'
                    });

                    $.lazyload.setInterval(100);

                    resolve();
                }, 1);
            });

            p.then(function () {
                $loadingPanel.css('display', '');
            });
        }

        ViewMode = "Table";

        $('#lnkTableMode').addClass('selected');
        var displayMode = window.sessionStorage.getItem('displayMode');
        $('.pie-results').css('display', 'none');
        $('.table-results').css('display', 'none');
        $('.detials-results').css('display', 'block');

        $.lazyload.refresh('.lazyTable');

    }
}

// Switch which tab's content is displayed.
function ShowTab(tabName) {
    $('#divSummary').css('display', 'none');
    $('#divPrecinct').css('display', 'none');
    $('#divTurnoutMap').css('display', 'none');
    $('#divReports').css('display', 'none');
    $('#divCounty').css('display', 'none');
    $('#divCountyTurnout').css('display', 'none');
    $('#divByPrecinct').css('display', 'none');

    $('#' + tabName).css('display', 'block');

    if ($('#divSummary').is(':visible')) {
        var serialized = window.sessionStorage.getItem('checkedItemList');
        var $checkboxes = $('#modalArea input[type="checkbox"][data-race]');
        var selected = [];

        if (serialized) {
            selected = serialized.split(',');
        }

        $('#lnkShowFilteredContests').hide();

        if (serialized !== null && selected.length < $checkboxes.length) {
            if ($('#ddlByPrecinct').selectpicker('val') === '') {
                $('#lnkShowAllContests').show();
            }

            $('#selectedContests').text(selected.length);
            $('#totalContests').text($checkboxes.length);
        }

        $('.summary-top').removeClass('hidden');
    } else {
        $('.summary-top').addClass('hidden');
    }
}

// Countdown timer function for auto-refreshing the page.
function RefreshDisplay() {
    if (__seconds === 0 && __minutes === 0) {
        if ($('#cbAutoRefresh').prop('checked')) {
            document.location.reload(true);
        } else {
            __seconds = 20;
        }
    } else if ($('#cbAutoRefresh').prop('checked')) {
        if (__seconds <= 0) {
            __minutes--;
            __seconds = 59;
        } else {
            __seconds--;
        }

        setTimeout(RefreshDisplay, 1000);
    }
}

// FaceBook share button function.
function FBShare(message, href) {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + href + '&quote=' + message, 'pop', 'width=600, height=400, scrollbars=no');
    return false;
}

function ToggleCollapseMenu() {
    var $region = $('#divTabMenuExpanded');

    $region.slideToggle(400, function () {
        $region.toggleClass('open').css('display', '');

        if ($region.hasClass('open')) {
            $region.attr('aria-expanded', 'true');
        } else {
            $region.attr('aria-expanded', 'false');
        }

        $region.focus();
    });

    return false;
}

// Summary tab click event handler.
function SummaryTabClick() {
    ShowTab('divSummary');
    SetDisplayMode('man');

    // Hide all of the menu button list items.
    $('.menu-button').parent().addClass('hidden');

    // Unhide all of the menu button list items that should be shown on the summary screen.
    $('#lnkAutoMode').parent().removeClass('hidden');
    $('#lnkManualMode').parent().removeClass('hidden');
    $('#lnkPanelMode').parent().removeClass('hidden');
    $('#lnkPieMode').parent().removeClass('hidden');
    $('#filterLink').parent().removeClass('hidden');
    $('#lnkPrint').parent().removeClass('hidden');
    $('#lnkTableMode').parent().removeClass('hidden');

    // Unhide the spacer element.
    $('.spacer').removeClass('hidden');
}

// By Precinct tab click event handler.
function ByPrecinctTabClick() {
    ShowTab('divByPrecinct');
    $('.menu-button').parent().addClass('hidden');
    $('.spacer').removeClass('hidden');
}

// Precinct tab click event handler.
function PrecinctTabClick() {
    ShowTab('divPrecinct');

    $('.menu-button').parent().addClass('hidden');
    google.maps.event.trigger(mapParticipating, 'resize');
    $('.spacer').removeClass('hidden');
}

// County tab click event handler.
function CountyTabClick() {
    ShowTab('divCounty');

    $('.menu-button').parent().addClass('hidden');
    $('.spacer').removeClass('hidden');
}

// Voter turnout tab click event handler.
function MapTabClick() {
    ShowTab('divTurnoutMap');

    $('.menu-button').parent().addClass('hidden');
    google.maps.event.trigger(mapTurnout, 'resize');
    $('.spacer').removeClass('hidden');
}

function MapCountyTabClick() {
    ShowTab('divCountyTurnout');

    $('.menu-button').parent().addClass('hidden');
    $('.spacer').removeClass('hidden');
}

// Report tab click event handler.
function ReportTabClick() {
    ShowTab('divReports');

    $('.menu-button').parent().addClass('hidden');
    $('.spacer').removeClass('hidden');
}

// Show the correct content area depending on which menu button is clicked (for the precincts reporting tab).
function PrecinctsReportingSubTabClick(subTabName) {
    if (subTabName === 'List') {
        $('#lnkPrecReportingList').addClass('selected');
        $('#lnkMapPrecinctsReporting').attr('class', 'menu-button');
        $('#lnkPrecinctsReportingTile').attr('class', 'menu-button');

        $('#listViewDiv').css('display', 'block');
        $('#precinctsReportingMapViewDiv').css('display', 'none');
        $('#precinctsReportingBoxDiv').css('display', 'none');
    } else if (subTabName === 'Map') {
        $('#lnkPrecReportingList').attr('class', 'menu-button');
        $('#lnkMapPrecinctsReporting').addClass('selected');
        $('#lnkPrecinctsReportingTile').attr('class', 'menu-button');

        $('#listViewDiv').css('display', 'none');
        $('#precinctsReportingMapViewDiv').css('display', 'block');
        $('#precinctsReportingBoxDiv').css('display', 'none');
        google.maps.event.trigger(mapParticipating, 'resize');
    } else if (subTabName === 'Tile') {
        $('#lnkPrecReportingList').attr('class', 'menu-button');
        $('#lnkMapPrecinctsReporting').attr('class', 'menu-button');
        $('#lnkPrecinctsReportingTile').addClass('selected');

        $('#listViewDiv').css('display', 'none');
        $('#precinctsReportingMapViewDiv').css('display', 'none');
        $('#precinctsReportingBoxDiv').css('display', 'block');
        google.maps.event.trigger(mapParticipating, 'resize');
    }
}

// Downloads the selected report.
function DownloadReport(report, format) {
    if (typeof format === 'undefined') {
        format = 'csv';
    }

    var iframe = $('#ifrmDownloadReport');
    var electionID = $('#electid').val();
    var suffix;

    if (window.location.href.indexOf('_New') > -1) {
        suffix = '_New';
    } else if (window.location.href.indexOf('_Pre') > -1) {
        suffix = '_Pre';
    } else {
        suffix = '';
    }

    var url = '';

    switch (report) {
        case 'contest':
            url = '../contests_' + electionID + suffix + '.' + format;
            break;
        case 'precinct':
            url = '../precincts_' + electionID + suffix + '.' + format;
            break;
        case 'precinct_detail':
            url = '../precinct_detail_' + electionID + suffix + '.' + format;
            break;
        case 'contestant':
            url = '../contestants_' + electionID + suffix + '.' + format;
            break;
        case 'summary':
            url = '../summary_' + electionID + suffix + '.' + format;
            break;
        case 'xml':
            url = '../summary_' + electionID + suffix + '.xml';
            break;
        default:
            // no default case
    }

    if (format === 'csv' || format === 'xlsx') {
        iframe.attr('src', url)
    } else if (format === 'pdf') {
        window.open(url, '_pdf');
    } else if (format === 'xml') {
        window.location = url;
    }
}

// Expand or collapse grouped contests in the filter results modal.
function ExpandCollapseModalGroup(element) {
    var $heading = $(element);
    var $span = $heading.find('span.far');
    var $body = $('#' + $heading.attr('aria-controls'));

    $body.slideToggle();
    $span.toggleClass('fa-minus-square fa-plus-square');

    if ($heading.attr('aria-expanded') === 'true') {
        $heading.attr('aria-expanded', 'false');
    } else {
        $heading.attr('aria-expanded', 'true');
    }
}

function SetDisplayMode(mode) {
    // Store the selected display mode into our global variable.
    window.sessionStorage.setItem('displayMode', mode);

    // Remove the "selected" class from the relevant buttons.
    $('#lnkAutoMode').removeClass('selected');
    $('#lnkManualMode').removeClass('selected');

    // Get references to our list and cycle layer containers.
    var $layer = $('.list-layer');
    var $cycle = $('.cycle-layer');
    var $slideGroup = $('.slide-group-name');


    var $loadingPanel = $('#loadingPanel');
    $loadingPanel.find('#loadingPanelText').text('Loading...');
    $loadingPanel.css('display', 'flex');

    if (mode === 'auto') {
        // Add the "selected" class to the correct button.
        $('#lnkAutoMode').addClass('selected');

        var p = new Promise(function (resolve) {
            setTimeout(function () {
                // Hide the show all / show filtered contests links.
                $('#lnkShowAllContests').hide();
                $('#lnkShowFilteredContests').hide();

                // Get all of the list items and put them in an array.
                // We will sort the array later by race id to display properly in the cycle.
                var listItems = $('.list-item').toArray();

                // Sort the array by the race id.
                listItems.sort(function (L, R) {
                    var lRaceId = Number(L.id.substring(L.id.lastIndexOf('_') + 1));
                    var rRaceId = Number(R.id.substring(R.id.lastIndexOf('_') + 1));
                    return lRaceId - rRaceId;
                });

                // Insert the items from the array into the cycle layer.
                $layer.css('display', 'none');
                $cycle.css('display', '');
                $slideGroup.css('display', 'block');

                // Append the list-items to the cycle layer.
                listItems.forEach(function (val) {
                    $cycle.append(val);
                });

                // Destroy the existing cycle layer and initialize a new cycle.
                $cycle.cycle('destroy');
                $cycle.removeAttr('style').children('div').removeAttr('style').css('display', 'block');

                //$.lazyload.check();
                $.lazyload.refresh('.lazy');

                // Hide races that were not selected.
                var serialized = window.sessionStorage.getItem('checkedItemList');
                var $checkboxes = $('#modalArea').find('input[type="checkbox"][data-race]');
                var selected = [];

                if (serialized) {
                    selected = serialized.split(',');
                }

                if (serialized !== null) {
                    $cycle.children('div').removeClass('visible').css('display', 'none');

                    for (var idx = 0; idx < selected.length; idx++) {
                        $cycle.find('#listid_' + selected[idx]).css('display', 'block').addClass('visible');
                    }
                } else {
                    $cycle.children('div').addClass('visible').css('display', 'block');
                }

                if (serialized !== null && selected.length < $checkboxes.length) {
                    $('#selectedContests').text(selected.length);
                    $('#totalContests').text($checkboxes.length);
                } else if (serialized !== null) {
                    $('#selectedContests').text($checkboxes.length);
                    $('#totalContests').text($checkboxes.length);
                }

                var opts = {}
                opts.fx = 'scrollUp';
                opts.speed = Number(__speed) * 1000;
                opts.slideExpr = '> .visible';
                opts.startingSlide = Number(window.sessionStorage.getItem('currentSlide'));
                opts.height = 'auto';

                if (Number(__delay) === 0) {
                    opts.continuous = true;
                    opts.easing = 'linear';
                } else {
                    opts.timeout = Number(__delay) * 1000;
                }

                opts.before = function (curr, next, o, fwdFlag) {
                    if (window.sessionStorage.getItem('viewmode') === 'pie') {
                        $.lazyload.refresh('.lazy');
                    }
                };

                opts.after = function (next, curr, o) {
                    if (window.sessionStorage.getItem('viewmode') === 'pie') {
                        $.lazyload.refresh('.lazy');
                    }

                    $(curr).find('a.heading').focus();
                    window.sessionStorage.setItem('currentSlide', o.currSlide);
                };

                // Initialize the cycle.
                $cycle.cycle(opts);

                resolve();
            }, 1);
        });

        p.then(function () {
            $loadingPanel.css('display', '');
        });
    } else if (mode === 'man') {
        // Add the "selected" class to the correct button.
        $('#lnkManualMode').addClass('selected');

        var p = new Promise(function (resolve) {
            setTimeout(function () {
                // Gather any list-items with group ids and insert them back into their proper group-containers.
                $('.group-container').each(function (idx, el) {
                    var groupId = $(el).data('group');
                    var $listItems = $('.list-item[data-group="' + groupId + '"]');
                    var sorted = $listItems.toArray().sort(function (L, R) {
                        var lRaceId = Number(L.id.substring(L.id.lastIndexOf('_') + 1));
                        var rRaceId = Number(R.id.substring(R.id.lastIndexOf('_') + 1));
                        return lRaceId - rRaceId;
                    });

                    sorted.forEach(function (val) {
                        el.appendChild(val);
                    });

                    $(el).children('div').removeAttr('style').css('display', 'block');
                });

                // For the remaining non-grouped list-items, add them back to the list-layer.
                $('.list-item:not([data-group])').each(function (idx, el) {
                    $layer.append(el);
                });

                $cycle.cycle('destroy');
                $cycle.css('display', 'none');
                $layer.css('display', 'block');
                $slideGroup.css('display', 'none');

                window.sessionStorage.setItem('currentSlide', 0);

                $layer.removeAttr('style').children('div').removeAttr('style').css('display', 'block');

                // Hide races that were not selected.
                var serialized = window.sessionStorage.getItem('checkedItemList');
                var $checkboxes = $('#modalArea').find('input[type="checkbox"][data-race]');
                var selected = [];

                if (serialized) {
                    selected = serialized.split(',');
                }

                if (serialized !== null) {
                    $layer.find('.list-item').css('display', 'none');

                    for (var idx = 0; idx < selected.length; idx++) {
                        $layer.find('#listid_' + selected[idx]).css('display', 'block');
                    }
                }

                if (serialized !== null && selected.length < $checkboxes.length) {
                    $('#selectedContests').text(selected.length);
                    $('#totalContests').text($checkboxes.length);

                    $('#lnkShowAllContests').show();
                } else if (serialized !== null) {
                    $('#selectedContests').text($checkboxes.length);
                    $('#totalContests').text($checkboxes.length);
                }

                serialized = window.sessionStorage.getItem('checkedGroups');

                if (serialized) {
                    selected = serialized.split(',');
                }

                if (serialized !== null) {
                    $layer.find('.group-container').css('display', 'none');

                    for (var idx = 0; idx < selected.length; idx++) {
                        $layer.find('#groupid_' + selected[idx]).css('display', 'block');
                    }
                }

                //$.lazyload.check();
                $.lazyload.refresh('.lazy');

                resolve();
            }, 1);
        });

        p.then(function () {
            $loadingPanel.css('display', '');
        });
    }
}

function GetMinimumDisplayTime() {
    var intMinDisTime = $('#hdnMinDisTime').val();
    return intMinDisTime;
}

function GetTimePerCandidate() {
    var intTimePerCandidate = $('#hdnTimePerCandidate').val();
    return intTimePerCandidate;
}

function GotoSelectedLanguage() {
    var pathname = document.location.pathname;
    var idx = pathname.lastIndexOf('/');
    var filename = pathname.substring(idx + 1);
    var search = document.location.search;
    var lang = $('#selectLanguage').val();

    pathname = pathname.substring(0, pathname.substring(0, idx).lastIndexOf('/')) + '/'
    var url = document.location.protocol + '//' + document.location.host + pathname + lang + '/' + filename + search;
    document.location.href = url;
}

function ShowAllContests() {
    // Get checked items and total contests.
    var serialized = window.sessionStorage.getItem('checkedItemList');
    var $checkboxes = $('#modalArea').find('input[type="checkbox"][data-race]');
    var selected = [];

    if (serialized) {
        selected = serialized.split(',');
    }

    // Show all contests.
    $('.group-container').css('display', 'block');
    $('.list-item').css('display', 'block');

    // If we have some items filtered, show the link to toggle shown contests.
    if (selected.length < $checkboxes.length && serialized !== null) {
        $('#lnkShowFilteredContests').text('Only Show Selected (' + selected.length + ')').show();
    }

    // Hide the show all contests link.
    $('#lnkShowAllContests').hide();

    // Change the label to properly show number of shown contests.
    //$('#filteredContestsLabel').text('Showing ' + $checkboxes.length + ' of ' + $checkboxes.length + ($checkboxes.length === 1 ? ' contest' : ' contests'));
    $('#selectedContests').text($checkboxes.length);
    $('#totalContests').text($checkboxes.length);
    $('#filteredContestsLabel').parent().focus();

    //$.lazyload.check();
    $.lazyload.refresh('.lazy');
}

function ShowFilteredContests() {
    // Get checked items and total contests.
    var serialized = window.sessionStorage.getItem('checkedItemList');
    var $checkboxes = $('#modalArea').find('input[type="checkbox"][data-race]');
    var selected = [];

    if (serialized) {
        selected = serialized.split(',');
    }

    // Show all filtered contests.
    $('.list-item').css('display', 'none');

    for (var idx = 0; idx < selected.length; idx++) {
        $('#listid_' + selected[idx]).css('display', 'block');
    }

    var serializedGroups = window.sessionStorage.getItem('checkedGroups');
    var selectedGroups = [];

    if (serializedGroups) {
        selectedGroups = serializedGroups.split(',');
    }

    $('.group-container').css('display', 'none');

    for (var idx = 0; idx < selectedGroups.length; idx++) {
        $('.group-container[data-group="' + selectedGroups[idx] + '"]').css('display', 'block');
    }

    // If we have some items filtered, show the link to toggle shown contests.
    if (selected.length < $checkboxes.length && serialized !== null) {
        $('#lnkShowAllContests').show();
    }

    // Hide the show filtered contests link.
    $('#lnkShowFilteredContests').hide();

    // Change the label to properly show number of shown contests.
    //$('#filteredContestsLabel').text('Showing ' + selected.length + ' of ' + $checkboxes.length + ($checkboxes.length === 1 ? ' contest' : ' contests'));
    $('#selectedContests').text(selected.length);
    $('#totalContests').text($checkboxes.length);
    $('#filteredContestsLabel').parent().focus();

    //$.lazyload.check();
    $.lazyload.refresh('.lazy');
}

function ShowToTopButton() {
    if ($(window).scrollTop() > 50) {
        $('#btnToTop').css({
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center'
        });
    } else {
        $('#btnToTop').hide();
    }
}

function GoToTop() {
    $('html, body').animate({
        scrollTop: 0
    }, 400);
}

function FormatThousandComma(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

//function DrawPieChart(dataArray, colorsObject, elem) {
//    // Assuming dataArray will come in the form ['Name', 'Votes']
//    // we want to append the % value to each column array
//    var totalVotes = dataArray.reduce(function (acc, val, idx) {
//        var votes = val[1];

//        if (val[0] !== 'WITHDRAWN') {
//            acc += votes;
//        }

//        return acc;
//    }, 0);

//    var dataArrayWithPercent = [];

//    dataArray.forEach(function (val, idx) {
//        var innerArr = [];
//        innerArr = innerArr.concat(val);

//        var votes = val[1];

//        if (totalVotes > 0) {
//            innerArr.push(votes / totalVotes);
//        } else {
//            innerArr.push(0);
//        }

//        dataArrayWithPercent.push(innerArr);
//    });

//    var data = {};
//    data.type = 'pie';
//    data.columns = (totalVotes === 0 ? [] : dataArray);
//    data.colors = colorsObject;
//    data.hide = ['WITHDRAWN'];
//    data.order = null;
//    data.empty = {
//        label: {
//            text: 'No data'
//        }
//    };

//    var legend = {};
//    legend.show = false;

//    var chart = c3.generate({
//        bindto: elem,
//        size: {
//            width: __isMobile === true ? 200 : 350,
//            height: __isMobile === true ? 200 : 350,
//        },
//        data: data,
//        legend: legend,
//        pie: {
//            label: {
//                show: false
//            }
//        }
//    });

//    $(elem).data('chart', chart);

//    // If we have an empty pie chart, draw an empty circle.
//    if (totalVotes === 0) {
//        var svg = $(elem).find('svg').get(0);
//        var path = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
//        path.setAttribute('stroke', 'black');
//        path.setAttribute('stroke-width', 1);
//        path.setAttribute('fill', 'transparent');
//        path.setAttribute('cx', $(svg).width() / 2);
//        path.setAttribute('cy', $(svg).height() / 2);
//        path.setAttribute('r', ($(svg).height() - 12) / 2);
//        path.setAttribute('name', 'emptyCircle');
//        svg.appendChild(path);
//    } else {
//        // otherwise we need to create a custom legend that shows each candidate's % votes
//        var legendItem = d3.select(elem)
//          .append('div')
//          .attr('class', 'legend')
//          .selectAll('div')
//          .data(dataArrayWithPercent.filter(function (val, idx) { return val[0] !== 'WITHDRAWN'; }))
//          .enter()
//          .append('div')
//          .attr('class', 'legend-item')
//          .attr('tabindex', 0)
//          .on('mouseover', function (d) { chart.focus(d[0]); })
//          .on('focus', function (d) { chart.focus(d[0]); })
//          .on('mouseout', function () { chart.revert(); })
//          .on('blur', function () { chart.revert(); });

//        legendItem.append('div').attr('class', 'legend-item-color').each(function (d) { d3.select(this).style('background-color', chart.color(d[0])); })
//        legendItem.append('span').text(function (d) {
//            var percent = d[2];
//            var fixed = 1;

//            if (percent * 100 < 10) {
//                fixed = 2;
//            } else if (percent * 100 === 100) {
//                // NOTE: Due to how floating-point numbers are compared (at least in Chrome), very close values may be considered to be equal
//                // for example: 99.99999999999999 !== 100.0 (99 with 14 nines after the decimal)
//                // however, 99.999999999999999 === 100.0 (99 with 15 nines after the decimal)
//                fixed = 0;
//            }

//            return d[0] + ' (' + parseFloat(parseFloat(percent) * 100).toFixed(fixed) + '%)';
//        });
//    }
//}


var XML_FILE = null;

function LoadXML(url) {
    var xhr;

    // Check for compatibility with IE5/6
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            XML_FILE = this.responseXML;
        }
    }

    xhr.open('GET', url + '?t=' + new Date().toISOString(), false);
    xhr.send();
}

function decodeCharacters(EncodeString) {
    var elem = document.createElement('textarea');
    elem.innerHTML = EncodeString
    var decode = elem.value;
    return decode
}

function GetXmlPieValues(RaceID) {
    var suffix;

    if (window.location.href.indexOf('_New') > -1) {
        suffix = '_New';
    } else if (window.location.href.indexOf('_Pre') > -1) {
        suffix = '_Pre';
    } else {
        suffix = '';
    }

    var electionID = $('#electid').val();

    if (XML_FILE === null || typeof XML_FILE === 'undefined') {
        LoadXML("../summary_" + electionID + suffix + ".xml")
    }

    var $xml = $(XML_FILE).children().eq(0);
    var DataArrayVar = [];
    var ColorArrayVar = {};
    var ContestantCount = 0

    $xml.children().each(function (tableID, table) {
        var $section = $(table);
        var $tableDiv;
        var currentRace = $section.children().filter('raceid')[0];
        var raceIdValueCoded = String($(currentRace).text());
        var raceIdValue = decodeCharacters(raceIdValueCoded);
        var Withdrawn = $section.children().filter('ContestantWithdrawn')[0];
        var WithdrawnEncode = String($(Withdrawn).text());
        var WithdrawnValue = decodeCharacters(WithdrawnEncode);



        if (WithdrawnValue != "Y") {


            if (RaceID == raceIdValue) {

                var currentContestant = $section.children().filter('ContestantName')[0];
                var currentVotes = $section.children().filter('TotalVotes')[0];
                var ContestantValueEncode = String($(currentContestant).text()).replace(/'/g, "\\'");

                var ContestantValue = decodeCharacters(ContestantValueEncode);


                //ContestantValue = ContestantValue.replace(/'/g, "\'");
                var VotesValueEncode = String($(currentVotes).text());
                var VotesValue = decodeCharacters(VotesValueEncode);

                //DataArrayVar = DataArrayVar + "['" + ContestantValue + "', " + VotesValue + "],";
                DataArrayVar.push([ContestantValue, Number(VotesValue)]);

                var currentColor = $section.children().filter('ContestantColor')[0];


                if (currentColor == null) {

                    if (ContestantCount > window.colorsObject.length) {

                        //ColorArrayVar = ColorArrayVar + "'" + ContestantValue + "':'#999999',"
                        ColorArrayVar[ContestantValue] = '#999999';

                    } else {

                        //ColorArrayVar = ColorArrayVar + "'" + ContestantValue + "':'" + window.colorsObject[ContestantCount] + "',"
                        ColorArrayVar[ContestantValue] = window.colorsObject[ContestantCount]
                    }


                } else {

                    var currentColorValue = decodeCharacters(String($(currentColor).text()));

                    //ColorArrayVar = ColorArrayVar + "'" + ContestantValue + "':'" + currentColorValue + "',"
                    ColorArrayVar[ContestantValue.replace(/\\'/g, "'")] = currentColorValue;

                }
                ContestantCount = ContestantCount + 1
            }

        }
        ////DrawPieChart(dataArray, colorsObject, elem);
    });

    //DataArrayVar = DataArrayVar.substring(0, DataArrayVar.length - 1);
    //DataArrayVar = DataArrayVar + "]";

    //ColorArrayVar = ColorArrayVar.substring(0, ColorArrayVar.length - 1);
    //ColorArrayVar = ColorArrayVar + "}";


    //(function() { var dataArray = [['Rey Gonzalez', 3144]];
    //    var colorsObject = {'Rey Gonzalez':'#87d37c'};
    //    var elem = $('.pie-results[data-race-id="302"]').get(0)

    //var colorsObject = { 'Ted Cruz': '#87d37c', 'Mary Miller': '#81cfe0', 'Geraldine Sam': '#f5d76e', 'Stefano de Stefano': '#6c7a89', 'Bruce Jacobson, Jr.': '#cd6fde' };

    //dataArray = [['Ted Cruz', 3495], ['Mary Miller', 3395], ['Geraldine Sam', 51], ['Stefano de Stefano', 70], ['Bruce Jacobson, Jr.', 129]];
    //GetDataArray = DataArrayVar;
    //GetColorArray = ColorArrayVar;

    return { GetDataArray: DataArrayVar, GetColorArray: ColorArrayVar };
}



function GetXmlTableValues(RaceID) {
    var suffix;

    if (window.location.href.indexOf('_New') > -1) {
        suffix = '_New';
    } else if (window.location.href.indexOf('_Pre') > -1) {
        suffix = '_Pre';
    } else {
        suffix = '';
    }

    var electionID = $('#electid').val();

    if (XML_FILE === null || typeof XML_FILE === 'undefined') {
        LoadXML("../summary_" + electionID + suffix + ".xml");
    }

    var dataArray;
    var $xml = $(XML_FILE).children().eq(0)
    var DataArrayVar = [];
    var ContestantCount = 0

    $xml.children().each(function (tableID, table) {

        var $section = $(table);
        var $tableDiv;
        var currentRace = $section.children().filter('raceid')[0];
        var raceIdValueCoded = String($(currentRace).text());
        var raceIdValue = decodeCharacters(raceIdValueCoded);
        var Withdrawn = $section.children().filter('ContestantWithdrawn')[0];
        var WithdrawnEncode = String($(Withdrawn).text());
        var WithdrawnValue = decodeCharacters(WithdrawnEncode);



        if (WithdrawnValue != "Y") {


            if (RaceID == raceIdValue) {

                var currentContestant = $section.children().filter('ContestantName')[0];
                var currentVotes = $section.children().filter('TotalVotes')[0];
                var ContestantValueEncode = String($(currentContestant).text()).replace(/'/g, "\\'");

                var ContestantValue = decodeCharacters(ContestantValueEncode);


                //ContestantValue = ContestantValue.replace(/'/g, "\'");
                var VotesValueEncode = String($(currentVotes).text());
                var VotesValue = decodeCharacters(VotesValueEncode);

                var currentEarlyVotes = $section.children().filter('EarlyVotes')[0];
                var EarlyVotesValueEncode = String($(currentEarlyVotes).text());
                var EarlyVotesValue = decodeCharacters(EarlyVotesValueEncode);

                var currentDayVotes = $section.children().filter('ElectionDayVotes')[0];
                var DayVotesValueEncode = String($(currentDayVotes).text());
                var DayVotesValue = decodeCharacters(DayVotesValueEncode);

                var currentProvisionalVotes = $section.children().filter('ProvisionalVotes')[0];
                var ProvisionalVotesValueEncode = String($(currentProvisionalVotes).text());
                var ProvisionalVotesValue = decodeCharacters(ProvisionalVotesValueEncode);

                var currentMailVotes = $section.children().filter('MailBallotVotes')[0];
                var MailVotesValueEncode = String($(currentMailVotes).text());
                var MailVotesValue = decodeCharacters(MailVotesValueEncode);


                //DataArrayVar = DataArrayVar + "['" + ContestantValue + "', " + VotesValue + ", " + EarlyVotesValue + ", " + DayVotesValue + ", " + ProvisionalVotesValue + ", " + MailVotesValue + "],";
                // 1 = Contestant Name
                // 2 = Early Votes
                // 3 = Election Day Votes
                // 4 = Provisional Votes
                // 5 = Absentee/Mail Ballot Votes
                // 6 = Total Votes
                DataArrayVar.push([ContestantValue, Number(EarlyVotesValue), Number(DayVotesValue), Number(ProvisionalVotesValue), Number(MailVotesValue), Number(VotesValue)]);
                //DataArrayVar = DataArrayVar + "['" + ContestantValue + "', " + EarlyVotesValue + ", " + DayVotesValue + ", " + ProvisionalVotesValue + ", " + MailVotesValue + ", " + VotesValue + "],";

                ContestantCount = ContestantCount + 1
            }

        }
        ////DrawPieChart(dataArray, colorsObject, elem);
    });

    //DataArrayVar = DataArrayVar.substring(0, DataArrayVar.length - 1);
    //DataArrayVar = DataArrayVar + "]";

    //ColorArrayVar = ColorArrayVar.substring(0, ColorArrayVar.length - 1);
    //ColorArrayVar = ColorArrayVar + "}";


    //(function() { var dataArray = [['Rey Gonzalez', 3144]];
    //    var colorsObject = {'Rey Gonzalez':'#87d37c'};
    //    var elem = $('.pie-results[data-race-id="302"]').get(0)

    //var colorsObject = { 'Ted Cruz': '#87d37c', 'Mary Miller': '#81cfe0', 'Geraldine Sam': '#f5d76e', 'Stefano de Stefano': '#6c7a89', 'Bruce Jacobson, Jr.': '#cd6fde' };

    //dataArray = [['Ted Cruz', 3495], ['Mary Miller', 3395], ['Geraldine Sam', 51], ['Stefano de Stefano', 70], ['Bruce Jacobson, Jr.', 129]];
    //GetDataArray = DataArrayVar;
    //GetColorArray = ColorArrayVar;

    return { GetDataArray: DataArrayVar };
}

function DrawDetailsTable(RaceID) {
    var ChartArrays = GetXmlTableValues(RaceID);
    //var DataArray = ChartArrays.GetDataArray;

    // eval('var dataArray=' + DataArrayString);
    //eval('var candidates = ' + DataArrayString);
    var candidates = ChartArrays.GetDataArray;

    // Find a <table> element with id="myTable":
    var table = document.getElementById("DetailsTable_" + RaceID);
    var ColumnVoteValues = document.getElementById("hdnVoterResultsTable").value;
    var arr = ColumnVoteValues.split('');
    var i = 1;

    candidates.forEach(function (candidateData) {
        var row = table.insertRow(i);
        var VoteListCount = candidates.length;

        var j = 0;
        var k = 0;

        candidateData.forEach(function (val) {
            var NumCheck = j + 1;

            if (arr.includes(NumCheck.toString())) {
                var cell1 = row.insertCell(k);
                cell1.innerHTML = val.toString().replace(/\\'/g, "'");

                if (VoteListCount != i) {
                    if (j == 0) {
                        cell1.className = "ContestantName";
                    } else {
                        cell1.className = "DetailRow";
                    }
                } else {
                    if (j == 0) {
                        cell1.className = "NameLastRow";
                    } else {
                        cell1.className = "DetailLastRow";
                    }
                }

                k++;
            }

            j++;
        });

        i++;
    });

    


}

function DrawPieChart(RaceID) {
    // Assuming dataArray will come in the form ['Name', 'Votes']
    // we want to append the % value to each column array


    //var colorsObject = { 'Ted Cruz': '#87d37c', 'Mary Miller': '#81cfe0', 'Geraldine Sam': '#f5d76e', 'Stefano de Stefano': '#6c7a89', 'Bruce Jacobson, Jr.': '#cd6fde' };
    var elem = $('.pie-results[data-race-id="' + RaceID + '"]').get(0)

    var ChartArrays = GetXmlPieValues(RaceID);

    //var dataArray = ChartArrays.GetDataArray;
    //var colorsObject = ChartArrays.GetColorArray;

    //var DataArrayString = ChartArrays.GetDataArray;
    //eval('var dataArray=' + DataArrayString);
    var dataArray = ChartArrays.GetDataArray.map(function (res) {
        res[0] = res[0].replace(/\\'/g, "'");
        return res;
    });

    //var ColorArrayString = ChartArrays.GetColorArray;
    //eval('var colorsObject=' + ColorArrayString);
    var colorsObject = ChartArrays.GetColorArray;


    //var dataArray = [['Rey Gonzalez', 3144]];
    //var colorsObject = {'Rey Gonzalez':'#87d37c'};
    //    var elem = $('.pie-results[data-race-id="302"]').get(0)

    var totalVotes = dataArray.reduce(function (acc, val, idx) {
        var votes = val[1];

        if (val[0] !== 'WITHDRAWN') {
            acc += votes;
        }

        return acc;
    }, 0);

    var dataArrayWithPercent = [];

    dataArray.forEach(function (val, idx) {
        var innerArr = [];
        innerArr = innerArr.concat(val);

        var votes = val[1];

        if (totalVotes > 0) {
            innerArr.push(votes / totalVotes);
        } else {
            innerArr.push(0);
        }

        dataArrayWithPercent.push(innerArr);
    });

    var data = {};
    data.type = 'pie';
    data.columns = (totalVotes === 0 ? [] : dataArray);
    data.colors = colorsObject;
    data.hide = ['WITHDRAWN'];
    data.order = null;
    data.empty = {
        label: {
            text: 'No data'
        }
    };

    var legend = {};
    legend.show = false;

    var chart = c3.generate({
        bindto: elem,
        size: {
            width: __isMobile === true ? 200 : 350,
            height: __isMobile === true ? 200 : 350,
        },
        data: data,
        legend: legend,
        pie: {
            label: {
                show: false
            }
        }
    });

    $(elem).data('chart', chart);

    // If we have an empty pie chart, draw an empty circle.
    if (totalVotes === 0) {
        var svg = $(elem).find('svg').get(0);
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        path.setAttribute('stroke', 'black');
        path.setAttribute('stroke-width', 1);
        path.setAttribute('fill', 'transparent');
        path.setAttribute('cx', $(svg).width() / 2);
        path.setAttribute('cy', $(svg).height() / 2);
        path.setAttribute('r', ($(svg).height() - 12) / 2);
        path.setAttribute('name', 'emptyCircle');
        svg.appendChild(path);
    } else {
        // otherwise we need to create a custom legend that shows each candidate's % votes
        var legendItem = d3.select(elem)
          .append('div')
          .attr('class', 'legend')
          .selectAll('div')
          .data(dataArrayWithPercent.filter(function (val, idx) { return val[0] !== 'WITHDRAWN'; }))
          .enter()
          .append('div')
          .attr('class', 'legend-item')
          .attr('tabindex', 0)
          .on('mouseover', function (d) { chart.focus(d[0]); })
          .on('focus', function (d) { chart.focus(d[0]); })
          .on('mouseout', function () { chart.revert(); })
          .on('blur', function () { chart.revert(); });

        legendItem.append('div').attr('class', 'legend-item-color').each(function (d) { d3.select(this).style('background-color', chart.color(d[0])); })
        legendItem.append('span').text(function (d) {
            var percent = d[2];
            var fixed = 1;

            if (percent * 100 < 10) {
                fixed = 2;
            } else if (percent * 100 === 100) {
                // NOTE: Due to how floating-point numbers are compared (at least in Chrome), very close values may be considered to be equal
                // for example: 99.99999999999999 !== 100.0 (99 with 14 nines after the decimal)
                // however, 99.999999999999999 === 100.0 (99 with 15 nines after the decimal)
                fixed = 0;
            }

            return d[0] + ' (' + parseFloat(parseFloat(percent) * 100).toFixed(fixed) + '%)';
        });
    }
}


function DrawDonutChart(dataArray, colorObject, elem) {
    var data = {
        type: 'donut',
        columns: dataArray,
        order: null,
        color: function (color, d) {
            if (typeof colorObject !== 'undefined' && colorObject !== null) {
                if (colorObject.hasOwnProperty(d)) {
                    return colorObject[d];
                } else {
                    return;
                }
            } else {
                if (d === 'remaining') {
                    return;
                } else {
                    return color;
                }
            }
        },
        hide: []
    };

    dataArray.forEach(function (val, idx) {
        if (val[1] === 0) {
            data.hide.push(val[0]);
        }
    });

    var legend = {
        show: false
    };

    var donut = {
        label: {
            show: false
        },
        width: 15
    };

    var interaction = {
        enabled: false
    }

    var chart = c3.generate({
        bindto: elem,
        size: { width: 76, height: 76 },
        data: data,
        legend: legend,
        donut: donut,
        interaction: interaction
    });

    $(elem).data('chart', chart);
}

function IsNearViewport(elem) {
    var screenWidth = window.innerWidth || document.documentElement.clientWidth;
    var screenHeight = window.innerHeight || document.documentElement.clientHeight;

    var rect = elem.getBoundingClientRect();
    var x1 = -200; // 200 is the threshold we set for lazyloading
    var y1 = x1;
    var x2 = screenWidth - x1;
    var y2 = screenHeight - y1;

    return (rect.top >= y1 && rect.top <= y2 || rect.bottom >= y1 && rect.bottom <= y2) &&
      (rect.left >= x1 && rect.left <= x2 || rect.right >= x1 && rect.right <= x2);
}

function OnWindowScroll() {
    __didScroll = true;
}

setInterval(function () {
    if (__didScroll) {
        __didScroll = false;

        // Check if we are qualified for mobile viewing.
        __isMobile = screen.width < 1024;

        ShowToTopButton();

        if (window.sessionStorage.getItem('viewmode') === 'pie') {
            //$.lazyload.check();
            $.lazyload.refresh('.lazy');
        } else if (window.sessionStorage.getItem('viewmode') === 'table') {
            // $.lazyload.check();
            $.lazyload.refresh('.lazyTable');
        }
    }
}, 1000);

// Event handler declarations and things to run after the page has loaded.
$(function () {
    __isMobile = screen.width < 1024;

    // Declare all of the event handlers first.
    $('#modal .panel-heading').on('click', function (ev) {
        ExpandCollapseModalGroup(this);
        ev.preventDefault();
    });

    $('#modal [id*=groupSelectId], #modal label[for*=groupSelectId]').on('click', function (ev) {
        ev.stopPropagation();

        var $this = $(this);
        var $checkbox;

        if (!$this.is('input')) {
            $checkbox = $this.find('input[type=checkbox]');
        } else {
            $checkbox = $this;
        }

        var groupId = $checkbox.data('group');
        var $raceCheckboxes = $('#modalArea input[type="checkbox"][data-race][data-group="' + groupId + '"]');

        if ($checkbox.prop('checked')) {
            $raceCheckboxes.prop('checked', true);
        } else {
            $raceCheckboxes.prop('checked', false);
        }

        $('#selectAll').prop('checked', AllRacesChecked());
    });

    $('.heading').on('click', function (ev) {
        ExpandCollapse(this);
        ev.preventDefault();
    });

    $('#cbAutoRefresh').on('change', function () {
        if ($(this).prop('checked')) {
            RefreshDisplay();
            window.sessionStorage.setItem('autorefresh', 'true');
        } else {
            window.sessionStorage.setItem('autorefresh', 'false');
        }
    });

    $('#filterLink').on('click', function (ev) {
        __currentFocus = document.activeElement;

        var $modal = $('#modal');
        $modal.modal('show');
        ev.preventDefault();
    });

    $('#selectAll').on('click', function () {
        var that = this;

        $('#modalArea').find('input[type="checkbox"]').each(function (idx, el) {
            $(el).prop('checked', $(that).prop('checked'));
        });
       
        $('#filterContainer').find('input[type="checkbox"]').each(function (idx, el) {
            $(el).prop('checked', false);
    });
    });

    $('#filterResults').on('click', function () {
        var that = this;
        $('#modalArea').find('.FilterResultChkBx').each(function (idx, el) {
            $(el).prop('checked', $(that).prop('checked'));
        });

        $('#modalArea').find('.RegResult').each(function (idx, el) {
           $(el).toggle();
        });

        $('#modalArea').find('.RegResultChkBx').each(function (idx, el) {
            if (that.checked) {
                $(el).prop("checked", false);
            } else {

            }
        });

        var grp_values = $('#HdnGroupFld').val();
        var grp_array = grp_values.split(',');

        if (grp_values !== '') {
            grp_array.forEach(function (val) {
                $('#' + val).toggle();
            });
        }

        var grp_ids = $('#HdnSelectGroupFld').val();
        var ids_array = grp_ids.split(',');

        if (grp_ids !== '') {
            ids_array.forEach(function (val) {
                $('#' + val).prop('checked', false);
            });
        }

        var grp_shown = $('#HdnShownGroupFld').val();
        var shown_array = grp_shown.split(',');

        if (grp_shown !== '') {
            shown_array.forEach(function (val) {
                var ckbx = $('#' + val);
                var groupId = ckbx.data('group');

                if (typeof groupId !== 'undefined' && groupId !== null) {
                    $('#modalArea input[type="checkbox"][id="groupSelectId_' + groupId + '"]').prop('checked', AllGroupRacesChecked(groupId));
                }
            });
        }

        $('#SelectAllContainer').find('input[type = "checkbox"]').each(function (idx, el) {
            if (that.checked) {
                $(el).prop("checked", false);
                $(el).prop("disabled", true);             
            } else {
                $(el).prop("disabled", false);              
            }
        });
    });   
    
    $('#customSearchCancel').on('click', function () {
        $('#modal').modal('hide');
    });

    $('#customSearchButton').on('click', function () {
        // Gather all selected races.
        var checkedItems = [];
        var checkedGroups = [];
        var $checkboxes = $('#modalArea').find('input[type="checkbox"][data-race]');

        $checkboxes.filter(':checked').each(function () {
            var $this = $(this);
            checkedItems.push($this.data('race'));
            var groupId = $this.data('group');

            if (groupId && checkedGroups.indexOf(groupId) === -1) {
                checkedGroups.push(groupId);
            }
        });

        // Set the values in the session storage object.
        window.sessionStorage.setItem('checkedItemList', checkedItems);
        window.sessionStorage.setItem('checkedGroups', checkedGroups);

        // Set the text in the 'showing x of y contests' label.
        //$('#filteredContestsLabel').text('Showing ' + checkedItems.length + ' of ' + $checkboxes.length + ' contests');
        $('#selectedContests').text(checkedItems.length);
        $('#totalContests').text($checkboxes.length);

        // Hide the show filtered contests link.
        $('#lnkShowFilteredContests').hide();

        // Show or hide link to show all contests.
        if (checkedItems.length < $checkboxes.length) {
            $('#lnkShowAllContests').show();
        } else {
            $('#lnkShowAllContests').hide();
        }

        // Hide the modal.
        $('#modal').modal('hide');
        var mode = window.sessionStorage.getItem('displayMode') || 'man';

        SetDisplayMode(mode);
    });

    $('#modal').on('show.bs.modal', function () {
        // Select previously selected elements.
        var serialized = window.sessionStorage.getItem('checkedItemList');
        var selected = [];

        if (serialized) {
            selected = serialized.split(',');
        }

        if (serialized !== null) {
            selected = selected.map(function (val, idx, arr) {
                return Number(val);
            });

            $(this).find('input[type="checkbox"][data-race]').each(function (idx, elem) {
                var $this = $(elem);
                var isSelected = (selected.indexOf($this.data('race')) >= 0 ? true : false);
                $this.prop('checked', isSelected);
            });

            $(this).find('input[type="checkbox"][id*="groupSelectId"]').each(function (idx, elem) {
                var $this = $(elem);
                var groupId = $this.data('group');
                $this.prop('checked', AllGroupRacesChecked(groupId));
            });
        }

        $('#selectAll').prop('checked', AllRacesChecked());
    });

    $('#modal').on('shown.bs.modal', function () {
        var $this = $(this);
        var firstFocus = $this.find('input, [tabindex]').get(0);
        firstFocus.focus();
    });

    $('#modal').on('hidden.bs.modal', function () {
        __currentFocus.focus();
    });

    $('#modal').on('keydown', function (ev) {
        var focusable = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]';
        var $this = $(this);

        // Trap the TAB key while the modal is open.
        // If the key pressed is the TAB key.
        if (ev.which === 9 && $this.is(':visible')) {
            var $elements = $this.find('*');
            var $focusableItems = $elements.filter(focusable).filter(':visible');
            var numberOfFocusableItems = $focusableItems.length;
            var $focusedItem = $(':focus');
            var focusedItemIdx = $focusableItems.index($focusedItem);

            // If holding shift while pressing tab (a backwards tab)
            if (ev.shiftKey) {
                // If we are on the first item, then loop around to the last item.
                if (focusedItemIdx === 0) {
                    $focusableItems.get(numberOfFocusableItems - 1).focus();
                    ev.preventDefault();
                }
            } else {
                // If we are on the last item, then loop around to the first item.
                if (focusedItemIdx === numberOfFocusableItems - 1) {
                    $focusableItems.get(0).focus();
                    ev.preventDefault();
                }
            }
        }
    });

    $('#modal input[type="checkbox"][data-race]').on('click', function () {
        var $this = $(this);
        var groupId = $this.data('group');

        if (typeof groupId !== 'undefined' && groupId !== null) {
            $('#modalArea input[type="checkbox"][id="groupSelectId_' + groupId + '"]').prop('checked', AllGroupRacesChecked(groupId));
        }

        $('#selectAll').prop('checked', AllRacesChecked());
    });

    $('.custom-tab').on('click', function () {
        var $this = $(this);

        if (!$this.parent().hasClass('tab-menu-collapse')) {
            $('.custom-tab').removeClass('selected');
            $this.addClass('selected');
        }
    });

    //// HARDCODED FOR SANDIEGO DEMO
    //$('#cb2percent').on('change', function () {
    //    var $this = $(this);
    //    var races = [338, 357, 372];

    //    $('.list-item').hide();

    //    if ($this.is(':checked')) {
    //        $('#selectAll').attr('disabled', true);
    //        $('#modalArea').find('input[type="checkbox"]').attr('disabled', true);

    //        races.forEach(function (val, idx) {
    //            $('[id*="listid_' + val + '"]').show();
    //        });

    //        $('#modal').modal('hide');
    //    } else {
    //        $('#selectAll').attr('disabled', false);
    //        $('#modalArea').find('input[type="checkbox"]').attr('disabled', false);

    //        $('#customSearchButton').trigger('click');
    //    }
    //});

    //// HARDCODED FOR SANDIEGO DEMO
    //$('#ddlByPrecinct').on('change', function () {
    //    var raceIDs = ['331', '332', '333', '334', '335', '336', '337', '338', '339', '380', '392', '562', '563', '620', '621', '622'];

    //    if ($(this).selectpicker('val') === '') {
    //        // TODO: Show everything and reset contestant vote totals.
    //        var contestants = [];
    //        contestants.push({ 'raceid': '331', 'contestantid': '1', 'vote1': 10930, 'vote2': 23727, 'percent': '100.00' });

    //        contestants.push({ 'raceid': '332', 'contestantid': '1', 'vote1': 4521, 'vote2': 10953, 'percent': '30.89' });
    //        contestants.push({ 'raceid': '332', 'contestantid': '2', 'vote1': 4481, 'vote2': 12110, 'percent': '33.12' });
    //        contestants.push({ 'raceid': '332', 'contestantid': '3', 'vote1': 5555, 'vote2': 12480, 'percent': '36.00' });

    //        contestants.push({ 'raceid': '333', 'contestantid': '1', 'vote1': 11153, 'vote2': 24682, 'percent': '100.00' });

    //        contestants.push({ 'raceid': '334', 'contestantid': '1', 'vote1': 5460, 'vote2': 16415, 'percent': '46.72' });
    //        contestants.push({ 'raceid': '334', 'contestantid': '2', 'vote1': 6971, 'vote2': 12219, 'percent': '40.99' });
    //        contestants.push({ 'raceid': '334', 'contestantid': '3', 'vote1': 1416, 'vote2': 4336, 'percent':'12.29' });

    //        contestants.push({ 'raceid': '335', 'contestantid': '1', 'vote1': 6675, 'vote2': 15187, 'percent': '46.61' });
    //        contestants.push({ 'raceid': '335', 'contestantid': '2', 'vote1': 2029, 'vote2': 6609, 'percent': '18.41' });
    //        contestants.push({ 'raceid': '335', 'contestantid': '3', 'vote1': 5306, 'vote2': 11102, 'percent': '34.98' });

    //        contestants.push({ 'raceid': '336', 'contestantid': '1', 'vote1': 10854, 'vote2': 23268, 'percent': '100.00' });

    //        contestants.push({ 'raceid': '337', 'contestantid': '1', 'vote1': 4978, 'vote2': 13067, 'percent': '37.29' });
    //        contestants.push({ 'raceid': '337', 'contestantid': '2', 'vote1': 9301, 'vote2': 21048, 'percent': '62.71' });

    //        contestants.push({ 'raceid': '338', 'contestantid': '1', 'vote1': 2309, 'vote2': 8151, 'percent': '22.13' });
    //        contestants.push({ 'raceid': '338', 'contestantid': '2', 'vote1': 5799, 'vote2': 12852, 'percent': '39.45' });
    //        contestants.push({ 'raceid': '338', 'contestantid': '3', 'vote1': 6009, 'vote2': 12153, 'percent': '38.42' });

    //        contestants.push({ 'raceid': '339', 'contestantid': '1', 'vote1': 3186, 'vote2': 10226, 'percent': '27.10' });
    //        contestants.push({ 'raceid': '339', 'contestantid': '2', 'vote1': 11131, 'vote2': 24943, 'percent': '72.90' });

    //        contestants.push({ 'raceid': '380', 'contestantid': '1', 'vote1': 9984, 'vote2': 25522, 'percent': '59.55' });
    //        contestants.push({ 'raceid': '380', 'contestantid': '2', 'vote1': 6194, 'vote2': 17922, 'percent': '40.45' });

    //        contestants.push({ 'raceid': '392', 'contestantid': '1', 'vote1': 583, 'vote2': 1438, 'percent': '72.91' });
    //        contestants.push({ 'raceid': '392', 'contestantid': '2', 'vote1': 178, 'vote2': 573, 'percent': '27.09' });

    //        contestants.push({ 'raceid': '562', 'contestantid': '1', 'vote1': 65785, 'vote2': 143875, 'percent': '82.63' });
    //        contestants.push({ 'raceid': '562', 'contestantid': '2', 'vote1': 11348, 'vote2': 32728, 'percent': '17.37' });

    //        contestants.push({ 'raceid': '563', 'contestantid': '1', 'vote1': 22799, 'vote2': 56378, 'percent': '30.97' });
    //        contestants.push({ 'raceid': '563', 'contestantid': '2', 'vote1': 54257, 'vote2': 122186, 'percent': '69.03' });

    //        contestants.push({ 'raceid': '620', 'contestantid': '1', 'vote1': 52079, 'vote2': 109475, 'percent': '64.53' });
    //        contestants.push({ 'raceid': '620', 'contestantid': '2', 'vote1': 24245, 'vote2': 64561, 'percent': '35.47' });

    //        contestants.push({ 'raceid': '621', 'contestantid': '1', 'vote1': 11134, 'vote2': 28693, 'percent': '68.97' });
    //        contestants.push({ 'raceid': '621', 'contestantid': '2', 'vote1': 4757, 'vote2': 13160, 'percent': '31.03' });

    //        contestants.push({ 'raceid': '622', 'contestantid': '1', 'vote1': 50154, 'vote2': 124586, 'percent': '67.80' });
    //        contestants.push({ 'raceid': '622', 'contestantid': '2', 'vote1': 27707, 'vote2': 55286, 'percent': '32.20' });

    //        raceIDs.forEach(function (raceID, idx) {
    //            $('.list-item').filter('[id*="listid_' + raceID + '"]').show();

    //            var $tds = $('td[data-race="' + raceID + '"][data-contestant]');
    //            var reduced = contestants.reduce(function (acc, con) {
    //                if (con.raceid === raceID) {
    //                    acc.push(con)
    //                }

    //                return acc;
    //            }, []);

    //            reduced.forEach(function (val, idx) {
    //                $tds.filter('[data-contestant="' + val.contestantid + '"][data-votes]').text(FormatThousandComma(val.vote1 + val.vote2));
    //                $tds.filter('[data-contestant="' + val.contestantid + '"][data-percent]').text(val.percent + '%');
    //                $tds.filter('[data-contestant="' + val.contestantid + '"] .percent-bar-inner').css('width', val.percent + '%');
    //            });
    //        });

    //        $('#modalArea').find('input[type="checkbox"]').attr('checked', true);
    //        $('#customSearchButton').trigger('click');

    //        SummaryTabClick();
    //        $('.custom-tab').removeClass('selected');
    //        $('#divSummaryTab .custom-tab').addClass('selected');
    //    } else {
    //        // Data for CLEVELAND-12-C.
    //        window.sessionStorage.setItem('checkedItemList', raceIDs);

    //        var contestants = [];
    //        contestants.push({ 'raceid': '331', 'contestantid': '1', 'totalvotes': 112, 'percent': '100.00' });

    //        contestants.push({ 'raceid': '332', 'contestantid': '1', 'totalvotes': 49, 'percent': '30.63' });
    //        contestants.push({ 'raceid': '332', 'contestantid': '2', 'totalvotes': 63, 'percent': '39.38' });
    //        contestants.push({ 'raceid': '332', 'contestantid': '3', 'totalvotes': 48, 'percent': '30.00' });

    //        contestants.push({ 'raceid': '333', 'contestantid': '1', 'totalvotes': 109, 'percent': '100.00' });

    //        contestants.push({ 'raceid': '334', 'contestantid': '1', 'totalvotes': 37, 'percent': '24.67' });
    //        contestants.push({ 'raceid': '334', 'contestantid': '2', 'totalvotes': 88, 'percent': '58.67' });
    //        contestants.push({ 'raceid': '334', 'contestantid': '3', 'totalvotes': 25, 'percent': '16.67' });

    //        contestants.push({ 'raceid': '335', 'contestantid': '1', 'totalvotes': 39, 'percent': '25.83' });
    //        contestants.push({ 'raceid': '335', 'contestantid': '2', 'totalvotes': 31, 'percent': '20.53' });
    //        contestants.push({ 'raceid': '335', 'contestantid': '3', 'totalvotes': 81, 'percent': '53.64' });

    //        contestants.push({ 'raceid': '336', 'contestantid': '1', 'totalvotes': 107, 'percent': '100.00' });

    //        contestants.push({ 'raceid': '337', 'contestantid': '1', 'totalvotes': 44, 'percent': '27.33' });
    //        contestants.push({ 'raceid': '337', 'contestantid': '2', 'totalvotes': 117, 'percent': '72.67' });

    //        contestants.push({ 'raceid': '338', 'contestantid': '1', 'totalvotes': 39, 'percent': '23.78' });
    //        contestants.push({ 'raceid': '338', 'contestantid': '2', 'totalvotes': 92, 'percent': '56.10' });
    //        contestants.push({ 'raceid': '338', 'contestantid': '3', 'totalvotes': 33, 'percent': '20.12' });

    //        contestants.push({ 'raceid': '339', 'contestantid': '1', 'totalvotes': 57, 'percent': '38.51' });
    //        contestants.push({ 'raceid': '339', 'contestantid': '2', 'totalvotes': 91, 'percent': '61.49' });

    //        contestants.push({ 'raceid': '380', 'contestantid': '1', 'totalvotes': 114, 'percent': '61.62' });
    //        contestants.push({ 'raceid': '380', 'contestantid': '2', 'totalvotes': 71, 'percent': '38.38' });

    //        contestants.push({ 'raceid': '392', 'contestantid': '1', 'totalvotes': 131, 'percent': '73.18' });
    //        contestants.push({ 'raceid': '392', 'contestantid': '2', 'totalvotes': 48, 'percent': '26.82' });

    //        contestants.push({ 'raceid': '562', 'contestantid': '1', 'totalvotes': 157, 'percent': '84.86' });
    //        contestants.push({ 'raceid': '562', 'contestantid': '2', 'totalvotes': 28, 'percent': '15.14' });

    //        contestants.push({ 'raceid': '563', 'contestantid': '1', 'totalvotes': 65, 'percent': '34.57' });
    //        contestants.push({ 'raceid': '563', 'contestantid': '2', 'totalvotes': 123, 'percent': '65.43' });

    //        contestants.push({ 'raceid': '620', 'contestantid': '1', 'totalvotes': 137, 'percent': '73.66' });
    //        contestants.push({ 'raceid': '620', 'contestantid': '2', 'totalvotes': 49, 'percent': '26.34' });

    //        contestants.push({ 'raceid': '621', 'contestantid': '1', 'totalvotes': 129, 'percent': '70.11' });
    //        contestants.push({ 'raceid': '621', 'contestantid': '2', 'totalvotes': 55, 'percent': '29.89' });

    //        contestants.push({ 'raceid': '622', 'contestantid': '1', 'totalvotes': 135, 'percent': '72.58' });
    //        contestants.push({ 'raceid': '622', 'contestantid': '2', 'totalvotes': 51, 'percent': '27.42' });

    //        var $checkboxes = $('#modalArea').find('input[type="checkbox"][data-race]');
    //        var $listItems = $('.list-item');
    //        $listItems.hide();

    //        raceIDs.forEach(function (raceID, idx) {
    //            $('.list-item').filter('[id*="listid_' + raceID + '"]').show();

    //            var $tds = $('td[data-race="' + raceID + '"][data-contestant]');
    //            var reduced = contestants.reduce(function (acc, con) {
    //                if (con.raceid === raceID) {
    //                    acc.push(con)
    //                }

    //                return acc;
    //            }, []);

    //            reduced.forEach(function (val, idx) {
    //                $tds.filter('[data-contestant="' + val.contestantid + '"][data-votes]').text(val.totalvotes);
    //                $tds.filter('[data-contestant="' + val.contestantid + '"][data-percent]').text(val.percent + '%');
    //                $tds.filter('[data-contestant="' + val.contestantid + '"] .percent-bar-inner').css('width', val.percent + '%');
    //            });
    //        });

    //        SummaryTabClick();
    //        $('.custom-tab').removeClass('selected');
    //        $('#divSummaryTab').addClass('selected');
    //        $('#lnkShowAllContests').hide();
    //        $('#lnkShowFilteredContests').hide();
    //    }
    //});

    // Mobile specific
    $('a.desktop-link').on('click', function () {
        var path = document.location.pathname;
        var regex = /Mobi_(\d+)(_New)?\.html/i;
        var match = path.match(regex);
        var electionID = match[1];
        var isNew = match[2];

        path = path.substring(0, path.lastIndexOf('/') + 1);

        var url = document.location.protocol + '//' + document.location.host;
        url += path;

        if (typeof isNew === 'undefined') {
            isNew = '';
        }

        document.location = url + 'Index_' + electionID + isNew + '.html?force=1';
    });

    $(window).on('resize', function () {
        // Check if we are qualified for mobile viewing.
        __isMobile = screen.width < 1024;

        if (__isMobile === true) {
            $('#headerDiv').css('margin-top', $('#divTopBar').height());
            var elems = document.getElementsByClassName('pie-results');
            var len = elems.length;

            for (var idx = 0; idx < len; idx++) {
                var elem = elems[idx];
                $(elem).data('chart').resize({ width: 200, height: 200 });
                var svg = $(elem).find('svg').get(0);
                var path = $(svg).find('circle[name="emptyCircle"]').get(0);

                if (path) {
                    path.setAttribute('cx', $(svg).width() / 2);
                    path.setAttribute('cy', $(svg).height() / 2);
                    path.setAttribute('r', ($(svg).height() - 12) / 2);
                }
            }
        } else {
            $('#headerDiv').css('margin-top', 0);
            var elems = document.getElementsByClassName('pie-results');
            var len = elems.length;

            for (var idx = 0; idx < len; idx++) {
                var elem = elems[idx];
                $(elem).data('chart').resize({ width: 350, height: 350 });
                var svg = $(elem).find('svg').get(0);
                var path = $(svg).find('circle[name="emptyCircle"]').get(0);

                if (path) {
                    path.setAttribute('cx', $(svg).width() / 2);
                    path.setAttribute('cy', $(svg).height() / 2);
                    path.setAttribute('r', ($(svg).height() - 12) / 2);
                }
            }
        }
    }).on('touchmove scroll', OnWindowScroll);

    // Run any post-load code after event handlers have been declared.
    var displayMode = 'man';
    var maxRaceID = $('#hdnMaxContestantRaceID').val();
    var maxContainer = $('#listid_' + maxRaceID);
    var headerHeight = maxContainer.find('.heading').eq(0).height();
    __maxHeight = maxContainer.find('.table-results').eq(0).height();
    __maxHeight += headerHeight;

    // 356 is the minimum height of .pie-results
    // 125 is the height of the contest header
    if (__maxHeight < 356) {
        __maxHeight = 356 + headerHeight;
    }

    if (window.sessionStorage && window.sessionStorage.getItem('displayMode') !== null) {
        displayMode = window.sessionStorage.getItem('displayMode');
    }

    if (window.sessionStorage && window.sessionStorage.getItem('currentSlide') === null) {
        window.sessionStorage.setItem('currentSlide', 0);
    }

    // Highlight the current tab
    if (displayMode !== 'man') {
        $('#lnkAutoMode').addClass('selected');
    } else {
        $('#lnkManualMode').addClass('selected');
    }

    __seconds = $('#hdnAutoRefresh').val();

    if (__seconds >= 60) {
        __minutes = __seconds / 60;
        __seconds %= 60;
    }

    __delay = $('#hdnMinDisTime').val();
    __speed = $('#hdnSlideshowSpeed').val();

    if (window.sessionStorage.getItem('autorefresh') === 'true') {
        $('#cbAutoRefresh').prop('checked', true);
        $('#cbAutoRefresh').trigger('change');
    } else if (window.sessionStorage.getItem('autorefresh') === 'false') {
        $('#cbAutoRefresh').prop('checked', false);
    }

    if (window.sessionStorage.getItem('viewmode') === null) {
        window.sessionStorage.setItem('viewmode', 'none');
    }

    //$('.progress-bar').each(function (idx, el) {
    //    $(el).animate({
    //        'width': $(el).data('width') + '%'
    //    }, 750);
    //});

    if (displayMode !== 'man') {
        $('#lnkAutoMode').addClass("selected");
    }

    // Preselect the current language from the dropdown
    (function () {
        var pathname = document.location.pathname;
        pathname = pathname.substring(0, pathname.lastIndexOf('/'));
        var idx = pathname.lastIndexOf('/');
        var lang = pathname.substring(idx + 1);
        $('#selectLanguage').val(lang);
    })();

    // Fill out the number of contests filtered.
    (function () {
        var serialized = window.sessionStorage.getItem('checkedItemList');
        var $checkboxes = $('#modalArea').find('input[type="checkbox"][data-race]');
        var selected = [];

        if (serialized) {
            selected = serialized.split(',');
        }

        //$('#filteredContestsLabel').text('Showing ' + (selected.length || $checkboxes.length) + ' of ' + $checkboxes.length + ($checkboxes.length === 1 ? ' contest' : ' contests'));
        $('#selectedContests').text(selected.length || $checkboxes.length);
        $('#totalContests').text($checkboxes.length);

        if (serialized !== null && selected.length < $checkboxes.length) {
            $('#lnkShowAllContests').show();
        } else if (serialized !== null) {
            $('#lnkShowAllContests').hide();
        }
    })();

    // If this is mobile, we need to set a top margin on the header.
    if (__isMobile === true) {
        $('#headerDiv').css('margin-top', $('#divTopBar').height());
    }

    var mode = window.sessionStorage.getItem('displayMode') || 'man';
    SetDisplayMode(mode);
    ToggleGraphs(window.sessionStorage.getItem('viewmode'));
});

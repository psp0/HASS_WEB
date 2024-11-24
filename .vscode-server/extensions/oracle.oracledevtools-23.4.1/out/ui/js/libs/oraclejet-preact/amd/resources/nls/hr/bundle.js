define(['exports'], (function(e){"use strict";const a={calendarDateConverter_parseError:e=>"Enter a complete date like this: "+e.dateExample+".",calendarMonthConverter_parseError:e=>"Enter a month and year like this: "+e.dateExample+".",chart_labelGroup:()=>"Grupa",chart_labelSeries:()=>"Serija",chart_labelValue:()=>"Vrijednost",checkboxSet_requiredMessageDetail:()=>"Obavezno",checkbox_requiredMessageDetail:()=>"Obavezno",close:()=>"Zatvori",collection_noData:()=>"Nema podataka za prikaz.",collection_selectAllRows:()=>"Odaberite sve retke",collection_selectRow:e=>"Odabir retka "+e.ROW_NAME,collection_sortDisabled:()=>"Bez mogućnosti sortiranja",collection_sortEnabled:()=>"Mogućnost sortiranja",confirmation:()=>"Potvrda",dataVisualization_labelAndValue:e=>e.LABEL+": "+e.VALUE,dataVisualization_labelCountWithTotal:e=>e.itemCount+" od "+e.totalCount,dataVisualization_noData:()=>"Nema podataka za prikaz",dataVisualization_stateSelected:()=>"Odabrano",dataVisualization_stateUnselected:()=>"Poništen odabir",error:()=>"Pogreška",expandableList_expandCollapseInstructionText:()=>"Za proširivanje i sažimanje upotrijebite tipke sa strelicama",expandableList_groupCollapse:()=>"Sakriveno",expandableList_groupExpand:()=>"Prošireno",filePicker_addFiles:()=>"Dodaj datoteke",filePicker_dropzonePrimaryText:()=>"Povuci i ispusti",filePicker_dropzoneSecondaryText:()=>"Odaberite datoteku ili je ovdje ispustite",filePicker_dropzoneSecondaryTextMultiple:()=>"Odaberite datoteke ili ih ovdje ispustite",filePicker_multipleFileTypeUploadError:e=>"Ne možete učitati datoteke koje pripadaju vrsti: "+e.fileTypes,filePicker_singleFileUploadError:()=>"Datoteke učitavajte jednu po jednu",filePicker_singleTypeUploadError:e=>"Ne možete učitati datoteke koje pripadaju vrsti "+e.fileType,filePicker_unknownFileTypeUploadError:()=>"nepoznato",formControl_clear:()=>"Očisti",formControl_day:()=>"Dan",formControl_helpAvailable:()=>"Pomoć dostupna",formControl_limitReached:e=>"Dostigli ste ograničenje od "+({one:new Intl.NumberFormat("hr").format(e.CHARACTER_LIMIT)+" znaka",few:new Intl.NumberFormat("hr").format(e.CHARACTER_LIMIT)+" znaka"}[new Intl.PluralRules("hr").select(e.CHARACTER_LIMIT)]||new Intl.NumberFormat("hr").format(e.CHARACTER_LIMIT)+" znakova")+".",formControl_loading:()=>"Učitavanje",formControl_maxLengthExceeded:e=>"Prekoračena je maksimalna duljina "+e.MAX_LENGTH+".",formControl_maxLengthRemaining:e=>"Preostali broj znakova: "+e.CHARACTER_COUNT+".",formControl_month:()=>"Mjesec",formControl_readOnly:()=>"Samo za čitanje",formControl_requiredMessageDetail:()=>"Unesite vrijednost.",formControl_year:()=>"Godina",gantt_labelDate:()=>"Datum",gantt_labelEnd:()=>"Završetak",gantt_labelLabel:()=>"Oznaka",gantt_labelRow:()=>"Redak",gantt_labelStart:()=>"Početak",indexer_disabledLabel:e=>e.SECTION+". Nije pronađena odgovarajuća sekcija.",indexer_keyboardInstructionText:()=>"Pritisnite Enter za odabir vrijednosti.",indexer_othersLabel:()=>"#",indexer_separatorLabel:e=>"Između "+e.FROM_SECTION+" i "+e.TO_SECTION+".",indexer_touchInstructionText:()=>"Dvaput pritisnite i zadržite kako biste otvorili način za poteze, a zatim povucite gore ili dolje za prilagodbu vrijednosti.",info:()=>"Informacije",inputDateMask_date_cleared:()=>"Datum očišćen",inputDateMask_dayPlaceholder:()=>"dd",inputDateMask_empty_segment:()=>"Pražnjenje",inputDateMask_monthPlaceholder:()=>"mm",inputDateMask_yearPlaceholder:()=>"gggg",inputMonthMask_dateRangeOverflowMessageDetail:e=>"Enter a month and year that's on or before "+e.max+".",inputMonthMask_dateRangeUnderflowMessageDetail:e=>"Enter a month and year that's on or after "+e.min+".",inputNumber_converterParseError:()=>"Unesite broj.",inputNumber_decrease:()=>"Smanji",inputNumber_increase:()=>"Povećaj",inputPassword_hidden:()=>"Lozinka skrivena",inputPassword_hide:()=>"Sakrij lozinku",inputPassword_show:()=>"Prikaži lozinku",inputSensitiveText_hidden:()=>"Sensitive text hidden",list_suggestion:()=>"Prijedlog",messageToast_allMessagesClosed:()=>"Zatvorene su sve poruke sa skočnim prozorčićem.",message_close:()=>"Zatvori",message_confirmation:()=>"Uspješno",message_error:()=>"Pogreška",message_info:()=>"Informacije",message_navigationFromMessagesRegion:()=>"Ulazite u područje za poruke. Pritisnite F6 za povratak na ranije fokusirani element.",message_navigationToMessagesRegion:()=>"U regiji za poruke postoje nove poruke. Pritisnite F6 kako biste se vratili na regiju najnovije poruke.",message_warning:()=>"Upozorenje",noData_message:()=>"Nema stavki za prikaz",overflowItemLabel:()=>"Više kartica",plural_separator:()=>", ",progressIndeterminate:()=>"U tijeku",radio_helpForRadio:()=>"Pomoć za izborni gumb",radio_requiredMessageDetail:()=>"Odabir vrijednosti.",selectMultiple_apply:()=>"Primijeni",selectMultiple_back:()=>"Natrag",selectMultiple_countPlus:e=>e.COUNT+"+",selectMultiple_highlightSelectedTagsInstructionText:()=>"Use left and right arrow keys to highlight selected values.",selectMultiple_removeSelectedTagInstructionText:()=>"Pritisnite Backspace ili Delete kako biste uklonili odabranu vrijednost.",selectMultiple_selectedValues:()=>"Odabrane vrijednosti",selectMultiple_showSelectedValues:()=>"Prikazuju se samo odabrane vrijednosti.",selectMultiple_valuesSelected:e=>"Odabran sljedeći broj vrijednosti: "+e.VALUE_COUNT+".",select_addToList:()=>"Dodaj na popis",select_addToListAvailable:()=>"Dodavanje na popis dostupno",select_moreSearchOptions:()=>"Dodatne opcije pretraživanja",select_moreSearchOptionsAvailable:()=>"Dostupne dodatne opcije pretraživanja",select_noMatchesFound:()=>"Nije pronađen nijedan rezultat.",select_oneMatchFound:()=>"Pronađen jedan rezultat",select_requiredMessageDetail:()=>"Odabir vrijednosti.",select_sizeMatchesFound:e=>"Pronađen sljedeći broj odgovarajućih rezultata: "+e.TOTAL_SIZE,select_sizeOrMoreMatchesFound:e=>"Pronađen sljedeći broj ili više odgovarajućih rezultata: "+e.TOTAL_SIZE,selectorAll_deselectAll:()=>"Poništi sve odabrano",selectorAll_selectAll:()=>"Odaberi sve",selector_selected:()=>"Potvrdni okvir uključen",selector_unselected:()=>"Potvrdni okvir nije uključen",tabBarNavigationList_removeCueText:()=>"Može se ukloniti",timeComponent_tooltipZoomIn:()=>"Povećaj prikaz",timeComponent_tooltipZoomOut:()=>"Smanji prikaz",train_current:()=>"Trenutačno",train_message_type:()=>"Vrsta poruke",train_not_visited:()=>"Nije posjećeno",train_status:e=>"Korak "+e.currentStep+" od "+e.numberOfSteps,train_visited:()=>"Posjećeno",userAssistance_learnMore:()=>"Saznajte više",userAssistance_required:()=>"Obavezno",viz_drillable:()=>"Može se analizirati",warn:()=>"Upozorenje"};e.default=a,Object.defineProperty(e,"__esModule",{value:!0})}));
//# sourceMappingURL=bundle.js.map
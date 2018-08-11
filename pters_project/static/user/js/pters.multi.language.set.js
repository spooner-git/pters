var multiLanguage = { 'KOR':
    {'DD':'매일', 'WW':'매주', '2W':'격주',
        'SUN':'일요일', 'MON':'월요일','TUE':'화요일','WED':'수요일','THS':'목요일','FRI':'금요일', 'SAT':'토요일',
        "WeekSmpl":['일','월','화','수','목','금','토']
    },
    'JPN':
        {'DD':'毎日', 'WW':'毎週', '2W':'隔週',
            'SUN':'日曜日', 'MON':'月曜日','TUE':'火曜日','WED':'水曜日','THS':'木曜日','FRI':'金曜日', 'SAT':'土曜日',
            "WeekSmpl":['日','月','火','水','木','金','土']
        },
    'ENG':
        {'DD':'Everyday', 'WW':'Weekly', '2W':'Bi-weekly',
            'SUN':'Sun', 'MON':'Mon','TUE':'Tue','WED':'Wed','THS':'Thr','FRI':'Fri', 'SAT':'Sat',
            "WeekSmpl":['Sun','Mon','Tue','Wed','Ths','Fri','Sat']
        }
};




var multi_language_set = {
                            "KOR":{  
                                    "text-hello":"안녕하세요!",
                                    "text-today":"오늘",
                                    "text-lesson":"레슨",
                                    "text-off":"OFF",
                                    "text-add":"추가",
                                    "text-plan":"일정",
                                    "text-lessonplan":"레슨<br>일정",
                                    "text-offplan":"OFF<br>일정",
                                    "text-addlessonplan":"+ 레슨 일정 등록",
                                    "text-addoffplan":"+ OFF 일정 등록",
                                    "text-todayplan":"오늘 일정",
                                    "text-weekplan" :"주간 일정",
                                    "text-monthplan":"월간 일정",
                                    "text-membermanage":"회원 관리",
                                    "text-groupmanage":"그룹 관리",
                                    "text-classmange":"클래스 관리",
                                    "text-analytics":"통계",
                                    "text-setting":"설정",
                                    "text-nameAttach":"님",
                                    "text-logout":"로그아웃",
                                    "text-alarm":"알림",
                                    "text-program":"프로그램",
                                    "text-programselect":"프로그램 선택",
                                    "text-mypage":"마이페이지",
                                    "text-help":"이용문의",

                                    "text-yes":"예",
                                    "text-no":"아니오",
                                    "text-ok":"확인",
                                    "text-close":"닫기",

                                    "text-plancomplete":"일정 완료",
                                    "text-plancancel":"일정 취소",
                                    "text-completesign":"완료 서명",
                                    "text-pleasesign":"회원님 완료 서명을 입력해주세요.",
                                    "text-participants":"참석자",

                                    "text-thisgroupmember":"이 유형 회원",
                                    "text-listloading":"리스트 불러오는 중...",
                                    "text-moveprogram":"프로그램을 선택하면 이동합니다.",
                                    "text-memocaution":"레슨일정의 메모는 회원님께 공유됩니다.",

                                    "text-deletequestion-plan":"정말 일정을 취소하시겠습니까?",

                                    "text-memberinfo":"회원 정보",

                                    "text-refresh":"새로고침",
                                    "text-zoomin":"일정 확대 보기",
                                    "text-zoomout":"일정 보기 원래대로",
                                    "text-youcan-usecal":"일정을 확인하고 등록 할 수 있습니다.",

                                    "text-dd":"매일", "text-ww":"매주", "text-2w":"격주",
                                    "text-sunday":"일요일", "text-monday":"월요일","text-tuesday":"화요일","text-wednesday":"수요일","text-thursday":"목요일","text-friday":"금요일","text-saturday":"토요일",
                                    "text-sundaymin":"일","text-mondaymin":"월","text-tuesdaymin":"화","text-wednesdaymin":"수","text-thursdaymin":"목","text-fridaymin":"금","text-saturdaymin":"토",
                                    
                                    "text-footerdisplay":"block",
                                    "text-company":"회사소개",
                                    "text-business":"제휴제안",
                                    "text-policy":"이용약관",
                                    "text-privacy":"개인정보처리방침",
                                    "text-manual":"사용법 및 FQA"
                                 },

                            "JPN":{  
                                    "text-hello":"Hello!",
                                    "text-today":"今日",
                                    "text-lesson":"レッスン",
                                    "text-off":"OFF",
                                    "text-add":"追加",
                                    "text-plan":"日程",
                                    "text-lessonplan":"レッスン<br>追加",
                                    "text-offplan":"OFF<br>追加",
                                    "text-addlessonplan":"+ レッスン プラン 追加",
                                    "text-addoffplan":"+ OFF プラン 追加",
                                    "text-todayplan":"今日の日程",
                                    "text-weekplan" :"週間カレンダー",
                                    "text-monthplan":"月間カレンダー",
                                    "text-membermanage":"会員管理",
                                    "text-groupmanage":"グループ管理",
                                    "text-classmange":"クラス管理",
                                    "text-analytics":"統計",
                                    "text-setting":"設定",
                                    "text-nameAttach":"様",
                                    "text-logout":"ログアウト",
                                    "text-alarm":"通知",
                                    "text-program":"プログラム",
                                    "text-programselect":"プログラム選択",
                                    "text-mypage":"マイページ",
                                    "text-help":"ヘルプ",

                                    "text-yes":"はい",
                                    "text-no":"いいえ",
                                    "text-ok":"確認",
                                    "text-close":"閉じる",

                                    "text-plancomplete":"日程完了",
                                    "text-plancancel":"日程削除",
                                    "text-completesign":"完了署名",
                                    "text-pleasesign":"会員の署名を書いてください",
                                    "text-participants":"参加者",

                                    "text-thisgroupmember":"このタイプのメンバー",
                                    "text-listloading":"リストをローディング中...",
                                    "text-moveprogram":"プログラムを選択してください。",
                                    "text-memocaution":"このメモ―は会員と共有します。",

                                    "text-deletequestion-plan":"日程を削除しますか",

                                    "text-memberinfo":"メンバー情報",

                                    "text-refresh":"Refresh",
                                    "text-zoomin":"拡大して見る",
                                    "text-zoomout":"元に戻す",
                                    "text-youcan-usecal":"スケジュールの登録・確認ができます。",

                                    "text-dd":"毎日", "text-ww":"毎週", "text-2w":"隔週",
                                    "text-sunday":"日曜日", "text-monday":"月曜日","text-tuesday":"火曜日","text-wednesday":"水曜日","text-thursday":"木曜日","text-friday":"金曜日","text-saturday":"土曜日",
                                    "text-sundaymin":"日","text-mondaymin":"月","text-tuesdaymin":"火","text-wednesdaymin":"水","text-thursdaymin":"木","text-fridaymin":"金","text-saturdaymin":"土",
                                    
                                    "text-footerdisplay":"none",
                                    "text-company":"会社紹介",
                                    "text-business":"提携",
                                    "text-policy":"利用規約",
                                    "text-privacy":"個人情報処理方針",
                                    "text-manual":"使用法＆FAQ"
                                 },

                            "ENG":{
                                    "text-hello":"What a nice day!",
                                    "text-today":"Today",
                                    "text-lesson":"Plan",
                                    "text-off":"OFF",
                                    "text-add":"Add",
                                    "text-plan":"Plan",
                                    "text-lessonplan":"Add<br>Plan",
                                    "text-offplan":"Add<br>OFF",
                                    "text-addlessonplan":"+ Add Plan",
                                    "text-addoffplan":"+ Add OFF",
                                    "text-todayplan":"Day Cal.",
                                    "text-weekplan" :"Week Cal.",
                                    "text-monthplan":"Month Cal.",
                                    "text-membermanage":"Members",
                                    "text-groupmanage":"Groups",
                                    "text-classmange":"Classes",
                                    "text-analytics":"Analytics",
                                    "text-setting":"Settings",
                                    "text-nameAttach":"",
                                    "text-logout":"Logout",
                                    "text-alarm":"Log",
                                    "text-program":"Program",
                                    "text-programselect":"Program Select",
                                    "text-mypage":"My page",
                                    "text-help":"Help",

                                    "text-yes":"Yes",
                                    "text-no":"No",
                                    "text-ok":"Ok",
                                    "text-close":"Close",

                                    "text-plancomplete":"Complete",
                                    "text-plancancel":"Delete",
                                    "text-completesign":"Signature",
                                    "text-pleasesign":"Write down member's signature.",
                                    "text-participants":"Participants",

                                    "text-thisgroupmember":"This type's Members",
                                    "text-listloading":"Loading list...",
                                    "text-moveprogram":"Change Program",
                                    "text-memocaution":"This memo is shared with the member.",

                                    "text-deletequestion-plan":"Are you sure to cancel the schedule?",

                                    "text-memberinfo":"Member Info.",

                                    "text-refresh":"Refresh",
                                    "text-zoomin":"Zoom in",
                                    "text-zoomout":"Zoom out",
                                    "text-youcan-usecal":"Manage schedule by week calendar",

                                    "text-dd":"매일", "text-ww":"매주", "text-2w":"격주",
                                    "text-sunday":"Sunday", "text-monday":"Monday","text-tuesday":"Tuesday","text-wednesday":"Wednesday","text-thursday":"Thursday","text-friday":"Friday","text-saturday":"Saturday",
                                    "text-sundaymin":"SUN","text-mondaymin":"MON","text-tuesdaymin":"TUE","text-wednesdaymin":"WED","text-thursdaymin":"THU","text-fridaymin":"FRI","text-saturdaymin":"SAT",
                                    
                                    "text-footerdisplay":"none",
                                    "text-company":"About us",
                                    "text-business":"Business",
                                    "text-policy":"Policy",
                                    "text-privacy":"Privacy Policy",
                                    "text-manual":"FAQ"
                                 }
};

//Trainer base - Menu Name
$('.text-hello').text(multi_language_set[Options.language]["text-hello"]);
$('.text-todayplan').text(multi_language_set[Options.language]["text-todayplan"]);
$('.text-weekplan').text(multi_language_set[Options.language]["text-weekplan"]);
$('.text-monthplan').text(multi_language_set[Options.language]["text-monthplan"]);
$('.text-membermanage').text(multi_language_set[Options.language]["text-membermanage"]);
$('.text-groupmanage').html(multi_language_set[Options.language]["text-groupmanage"]);
$('.text-classmanage').html(multi_language_set[Options.language]["text-classmange"]);
$('.text-workmanage').text(multi_language_set[Options.language]["text-analytics"]);
$('.text-setting').text(multi_language_set[Options.language]["text-setting"]);
$('.text-nameAttach').text(multi_language_set[Options.language]["text-nameAttach"]);
$('.text-logout').text(multi_language_set[Options.language]["text-logout"]);
$('#uptext span').text("님 일정");
$('.text-alarm').text(multi_language_set[Options.language]["text-alarm"]);
$('.text-calSelect').text(multi_language_set[Options.language]["text-programselect"]);
$('.text-mypage').text(multi_language_set[Options.language]["text-mypage"]);
$('.text-help').text(multi_language_set[Options.language]["text-help"]);
$('.text-moveprogram').text(multi_language_set[Options.language]["text-moveprogram"])


//Trainer Base - Popups
$('.text-plancomplete').text(multi_language_set[Options.language]["text-plancomplete"]);
$('.text-plancancel').text(multi_language_set[Options.language]["text-plancancel"]);
$('.text-participants').text(multi_language_set[Options.language]["text-participants"]);
$('.text-completesign').text(multi_language_set[Options.language]["text-completesign"]);

$('.text-ok').text(multi_language_set[Options.language]["text-ok"]);
$('.text-yes').text(multi_language_set[Options.language]["text-yes"]);
$('.text-no').text(multi_language_set[Options.language]["text-no"]);
$('.text-close').text(multi_language_set[Options.language]["text-close"]);

$('.text-deletequestion-plan').text(multi_language_set[Options.language]["text-deletequestion-plan"])
$('.text-memberinfo').text(multi_language_set[Options.language]["text-memberinfo"]);
$('.text-thisgroupmember').text(multi_language_set[Options.language]["text-thisgroupmember"]);

//Calendar
$('.text-sundaymin').text(multi_language_set[Options.language]["text-sundaymin"]);
$('.text-mondaymin').text(multi_language_set[Options.language]["text-mondaymin"]);
$('.text-tuesdaymin').text(multi_language_set[Options.language]["text-tuesdaymin"]);
$('.text-wednesdaymin').text(multi_language_set[Options.language]["text-wednesdaymin"]);
$('.text-thursdaymin').text(multi_language_set[Options.language]["text-thursdaymin"]);
$('.text-fridaymin').text(multi_language_set[Options.language]["text-fridaymin"]);
$('.text-saturdaymin').text(multi_language_set[Options.language]["text-saturdaymin"]);
$('.text-refresh').text(multi_language_set[Options.language]["text-refresh"]);
$('.text-zoomout').text(multi_language_set[Options.language]["text-zoomout"]);
$('.text-zoomin').text(multi_language_set[Options.language]["text-zoomin"]);
$('.text-youcan-usecal').text(multi_language_set[Options.language]["text-youcan-usecal"]);
$('.text-today').text(multi_language_set[Options.language]["text-today"]);
$('.text-lessonplan').html(multi_language_set[Options.language]["text-lessonplan"]);
$('.text-offplan').html(multi_language_set[Options.language]["text-offplan"]);
$('.text-addoffplan').text(multi_language_set[Options.language]["text-addoffplan"]);
$('.text-addlessonplan').text(multi_language_set[Options.language]["text-addlessonplan"]);


//Footer
$('.text-company').text(multi_language_set[Options.language]["text-company"]);
$('.text-business').text(multi_language_set[Options.language]["text-business"]);
$('.text-policy').text(multi_language_set[Options.language]["text-policy"]);
$('.text-privacy').text(multi_language_set[Options.language]["text-privacy"]);
$('.text-manual').text(multi_language_set[Options.language]["text-manual"]);

$('.text-footerdisplay').css('display',multi_language_set[Options.language]["text-footerdisplay"])


//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);
//$('.text-').text(multi_language_set[Options.language]["text-"]);

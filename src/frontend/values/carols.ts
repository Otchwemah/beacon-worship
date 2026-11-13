// Beacon Worship — Christmas carols. All texts PUBLIC DOMAIN (pre-1929 publications).
import type { LibrarySong } from "./songLibrary"

export const CHRISTMAS_CAROLS: LibrarySong[] = [
    {
        id: "o_come_all_ye_faithful",
        title: "O Come, All Ye Faithful",
        author: "John Francis Wade, tr. Frederick Oakeley",
        composer: "ADESTE FIDELES",
        year: "1743",
        chorus: "O come, let us adore Him,\nO come, let us adore Him,\nO come, let us adore Him,\nChrist the Lord!",
        verses: [
            "O come, all ye faithful,\nJoyful and triumphant,\nO come ye, O come ye to Bethlehem;\nCome and behold Him,\nBorn the King of angels;",
            "Sing, choirs of angels,\nSing in exultation,\nSing, all ye citizens of heaven above;\nGlory to God,\nGlory in the highest;",
            "Yea, Lord, we greet Thee,\nBorn this happy morning;\nJesus, to Thee be glory given;\nWord of the Father,\nNow in flesh appearing;"
        ]
    },
    {
        id: "hark_the_herald",
        title: "Hark! The Herald Angels Sing",
        author: "Charles Wesley",
        composer: "MENDELSSOHN",
        year: "1739",
        chorus: "Hark! the herald angels sing,\n\"Glory to the newborn King!\"",
        verses: [
            "Hark! the herald angels sing,\n\"Glory to the newborn King;\nPeace on earth, and mercy mild,\nGod and sinners reconciled!\"\nJoyful, all ye nations, rise,\nJoin the triumph of the skies;\nWith the angelic host proclaim,\n\"Christ is born in Bethlehem!\"",
            "Christ, by highest heaven adored,\nChrist, the everlasting Lord;\nLate in time behold Him come,\nOffspring of the virgin's womb.\nVeiled in flesh the Godhead see;\nHail the incarnate Deity,\nPleased as man with man to dwell,\nJesus, our Emmanuel.",
            "Hail the heaven-born Prince of Peace!\nHail the Sun of Righteousness!\nLight and life to all He brings,\nRisen with healing in His wings.\nMild He lays His glory by,\nBorn that man no more may die,\nBorn to raise the sons of earth,\nBorn to give them second birth."
        ]
    },
    {
        id: "silent_night",
        title: "Silent Night, Holy Night",
        author: "Joseph Mohr, tr. John F. Young",
        composer: "STILLE NACHT",
        year: "1818",
        verses: [
            "Silent night, holy night,\nAll is calm, all is bright\nRound yon virgin mother and Child.\nHoly Infant, so tender and mild,\nSleep in heavenly peace,\nSleep in heavenly peace.",
            "Silent night, holy night,\nShepherds quake at the sight;\nGlories stream from heaven afar,\nHeavenly hosts sing alleluia;\nChrist, the Saviour, is born,\nChrist, the Saviour, is born.",
            "Silent night, holy night,\nSon of God, love's pure light\nRadiant beams from Thy holy face,\nWith the dawn of redeeming grace,\nJesus, Lord, at Thy birth,\nJesus, Lord, at Thy birth.",
            "Silent night, holy night,\nWondrous star, lend thy light;\nWith the angels let us sing,\nAlleluia to our King;\nChrist the Saviour is born,\nChrist the Saviour is born."
        ]
    },
    {
        id: "joy_to_the_world",
        title: "Joy to the World",
        author: "Isaac Watts",
        composer: "ANTIOCH",
        year: "1719",
        verses: [
            "Joy to the world! the Lord is come;\nLet earth receive her King;\nLet every heart prepare Him room,\nAnd heaven and nature sing,\nAnd heaven and nature sing,\nAnd heaven, and heaven and nature sing.",
            "Joy to the earth! the Saviour reigns;\nLet men their songs employ;\nWhile fields and floods, rocks, hills and plains\nRepeat the sounding joy,\nRepeat the sounding joy,\nRepeat, repeat the sounding joy.",
            "No more let sins and sorrows grow,\nNor thorns infest the ground;\nHe comes to make His blessings flow\nFar as the curse is found,\nFar as the curse is found,\nFar as, far as the curse is found.",
            "He rules the world with truth and grace,\nAnd makes the nations prove\nThe glories of His righteousness,\nAnd wonders of His love,\nAnd wonders of His love,\nAnd wonders, wonders of His love."
        ]
    },
    {
        id: "o_little_town",
        title: "O Little Town of Bethlehem",
        author: "Phillips Brooks",
        composer: "ST. LOUIS",
        year: "1868",
        verses: [
            "O little town of Bethlehem,\nHow still we see thee lie!\nAbove thy deep and dreamless sleep\nThe silent stars go by;\nYet in thy dark streets shineth\nThe everlasting Light;\nThe hopes and fears of all the years\nAre met in thee tonight.",
            "For Christ is born of Mary,\nAnd gathered all above,\nWhile mortals sleep, the angels keep\nTheir watch of wondering love.\nO morning stars, together\nProclaim the holy birth,\nAnd praises sing to God the King,\nAnd peace to men on earth.",
            "How silently, how silently,\nThe wondrous gift is given!\nSo God imparts to human hearts\nThe blessings of His heaven.\nNo ear may hear His coming,\nBut in this world of sin,\nWhere meek souls will receive Him still,\nThe dear Christ enters in.",
            "O holy Child of Bethlehem,\nDescend to us, we pray;\nCast out our sin and enter in,\nBe born in us today.\nWe hear the Christmas angels\nThe great glad tidings tell;\nO come to us, abide with us,\nOur Lord Emmanuel."
        ]
    },
    {
        id: "away_in_a_manger",
        title: "Away in a Manger",
        author: "Anonymous",
        composer: "MUELLER",
        year: "1885",
        verses: [
            "Away in a manger, no crib for a bed,\nThe little Lord Jesus laid down His sweet head;\nThe stars in the bright sky looked down where He lay,\nThe little Lord Jesus asleep on the hay.",
            "The cattle are lowing, the baby awakes,\nBut little Lord Jesus, no crying He makes;\nI love Thee, Lord Jesus! look down from the sky,\nAnd stay by my cradle till morning is nigh.",
            "Be near me, Lord Jesus; I ask Thee to stay\nClose by me for ever, and love me, I pray;\nBless all the dear children in Thy tender care,\nAnd fit us for heaven, to live with Thee there."
        ]
    },
    {
        id: "the_first_noel",
        title: "The First Noel",
        author: "Traditional English",
        composer: "THE FIRST NOWELL",
        year: "1823",
        chorus: "Noel, Noel, Noel, Noel,\nBorn is the King of Israel!",
        verses: [
            "The first Noel the angel did say\nWas to certain poor shepherds in fields as they lay;\nIn fields where they lay keeping their sheep,\nOn a cold winter's night that was so deep.",
            "They looked up and saw a star\nShining in the east, beyond them far,\nAnd to the earth it gave great light,\nAnd so it continued both day and night.",
            "And by the light of that same star\nThree wise men came from country far;\nTo seek for a king was their intent,\nAnd to follow the star wherever it went.",
            "Then entered in those wise men three,\nFull reverently upon their knee,\nAnd offered there in His presence\nTheir gold, and myrrh, and frankincense.",
            "Then let us all with one accord\nSing praises to our heavenly Lord,\nThat hath made heaven and earth of nought,\nAnd with His blood mankind hath bought."
        ]
    },
    {
        id: "o_come_o_come_emmanuel",
        title: "O Come, O Come, Emmanuel",
        author: "Latin, 12th c., tr. John M. Neale",
        composer: "VENI EMMANUEL",
        year: "1851",
        chorus: "Rejoice! Rejoice! Emmanuel\nShall come to thee, O Israel.",
        verses: [
            "O come, O come, Emmanuel,\nAnd ransom captive Israel,\nThat mourns in lonely exile here\nUntil the Son of God appear.",
            "O come, Thou Rod of Jesse, free\nThine own from Satan's tyranny;\nFrom depths of hell Thy people save,\nAnd give them victory o'er the grave.",
            "O come, Thou Dayspring, come and cheer\nOur spirits by Thine advent here;\nDisperse the gloomy clouds of night,\nAnd death's dark shadows put to flight.",
            "O come, Thou Key of David, come,\nAnd open wide our heavenly home;\nMake safe the way that leads on high,\nAnd close the path to misery.",
            "O come, Thou Wisdom from on high,\nAnd order all things far and nigh;\nTo us the path of knowledge show,\nAnd cause us in her ways to go."
        ]
    },
    {
        id: "angels_we_have_heard",
        title: "Angels We Have Heard on High",
        author: "Traditional French, tr. James Chadwick",
        composer: "GLORIA",
        year: "1862",
        chorus: "Glo-o-o-o-o-o-o-o-o-oria,\nIn excelsis Deo!\nGlo-o-o-o-o-o-o-o-o-oria,\nIn excelsis Deo!",
        verses: [
            "Angels we have heard on high,\nSweetly singing o'er the plains,\nAnd the mountains in reply\nEchoing their joyous strains.",
            "Shepherds, why this jubilee?\nWhy your joyous strains prolong?\nWhat the gladsome tidings be\nWhich inspire your heavenly song?",
            "Come to Bethlehem and see\nHim whose birth the angels sing;\nCome, adore on bended knee\nChrist the Lord, the newborn King.",
            "See Him in a manger laid,\nWhom the choirs of angels praise;\nMary, Joseph, lend your aid,\nWhile our hearts in love we raise."
        ]
    },
    {
        id: "what_child_is_this",
        title: "What Child Is This?",
        author: "William Chatterton Dix",
        composer: "GREENSLEEVES",
        year: "1865",
        chorus: "This, this is Christ the King,\nWhom shepherds guard and angels sing;\nHaste, haste to bring Him laud,\nThe Babe, the Son of Mary.",
        verses: [
            "What Child is this, who, laid to rest,\nOn Mary's lap is sleeping?\nWhom angels greet with anthems sweet,\nWhile shepherds watch are keeping?",
            "Why lies He in such mean estate\nWhere ox and ass are feeding?\nGood Christian, fear; for sinners here\nThe silent Word is pleading.",
            "So bring Him incense, gold, and myrrh,\nCome, peasant, king, to own Him;\nThe King of kings salvation brings,\nLet loving hearts enthrone Him."
        ]
    },
    {
        id: "we_three_kings",
        title: "We Three Kings",
        author: "John Henry Hopkins Jr.",
        composer: "KINGS OF ORIENT",
        year: "1857",
        chorus: "O star of wonder, star of night,\nStar with royal beauty bright,\nWestward leading, still proceeding,\nGuide us to thy perfect light.",
        verses: [
            "We three kings of Orient are;\nBearing gifts we traverse afar\nField and fountain, moor and mountain,\nFollowing yonder star.",
            "Born a King on Bethlehem's plain,\nGold I bring to crown Him again,\nKing for ever, ceasing never\nOver us all to reign.",
            "Frankincense to offer have I;\nIncense owns a Deity nigh;\nPrayer and praising, all men raising,\nWorship Him, God on high.",
            "Myrrh is mine; its bitter perfume\nBreathes a life of gathering gloom;\nSorrowing, sighing, bleeding, dying,\nSealed in the stone-cold tomb.",
            "Glorious now behold Him arise,\nKing and God and Sacrifice;\nAlleluia, alleluia!\nSounds through the earth and skies."
        ]
    },
    {
        id: "god_rest_ye_merry",
        title: "God Rest You Merry, Gentlemen",
        author: "Traditional English",
        composer: "GOD REST YOU MERRY",
        year: "1833",
        chorus: "O tidings of comfort and joy,\nComfort and joy;\nO tidings of comfort and joy.",
        verses: [
            "God rest you merry, gentlemen,\nLet nothing you dismay,\nRemember Christ our Saviour\nWas born on Christmas Day,\nTo save us all from Satan's power\nWhen we were gone astray.",
            "From God our heavenly Father\nA blessed angel came;\nAnd unto certain shepherds\nBrought tidings of the same:\nHow that in Bethlehem was born\nThe Son of God by name.",
            "\"Fear not, then,\" said the angel,\n\"Let nothing you affright;\nThis day is born a Saviour\nOf a pure virgin bright,\nTo free all those who trust in Him\nFrom Satan's power and might.\"",
            "Now to the Lord sing praises,\nAll you within this place,\nAnd with true love and brotherhood\nEach other now embrace;\nThis holy tide of Christmas\nAll other doth deface."
        ]
    },
    {
        id: "it_came_upon",
        title: "It Came Upon the Midnight Clear",
        author: "Edmund H. Sears",
        composer: "CAROL",
        year: "1849",
        verses: [
            "It came upon the midnight clear,\nThat glorious song of old,\nFrom angels bending near the earth\nTo touch their harps of gold:\n\"Peace on the earth, good will to men,\nFrom heaven's all-gracious King.\"\nThe world in solemn stillness lay\nTo hear the angels sing.",
            "Still through the cloven skies they come\nWith peaceful wings unfurled,\nAnd still their heavenly music floats\nO'er all the weary world;\nAbove its sad and lowly plains\nThey bend on hovering wing,\nAnd ever o'er its Babel sounds\nThe blessed angels sing.",
            "And ye, beneath life's crushing load,\nWhose forms are bending low,\nWho toil along the climbing way\nWith painful steps and slow,\nLook now! for glad and golden hours\nCome swiftly on the wing;\nO rest beside the weary road,\nAnd hear the angels sing.",
            "For lo! the days are hastening on,\nBy prophet bards foretold,\nWhen with the ever-circling years\nComes round the age of gold;\nWhen peace shall over all the earth\nIts ancient splendours fling,\nAnd the whole world give back the song\nWhich now the angels sing."
        ]
    },
    {
        id: "once_in_royal",
        title: "Once in Royal David's City",
        author: "Cecil Frances Alexander",
        composer: "IRBY",
        year: "1848",
        verses: [
            "Once in royal David's city\nStood a lowly cattle shed,\nWhere a mother laid her baby\nIn a manger for His bed;\nMary was that mother mild,\nJesus Christ her little child.",
            "He came down to earth from heaven\nWho is God and Lord of all,\nAnd His shelter was a stable,\nAnd His cradle was a stall;\nWith the poor, and mean, and lowly,\nLived on earth our Saviour holy.",
            "And through all His wondrous childhood\nHe would honour and obey,\nLove and watch the lowly maiden\nIn whose gentle arms He lay;\nChristian children all must be\nMild, obedient, good as He.",
            "And our eyes at last shall see Him,\nThrough His own redeeming love;\nFor that child so dear and gentle\nIs our Lord in heaven above;\nAnd He leads His children on\nTo the place where He is gone."
        ]
    },
    {
        id: "good_king_wenceslas",
        title: "Good King Wenceslas",
        author: "John Mason Neale",
        composer: "TEMPUS ADEST FLORIDUM",
        year: "1853",
        verses: [
            "Good King Wenceslas looked out\nOn the feast of Stephen,\nWhen the snow lay round about,\nDeep and crisp and even;\nBrightly shone the moon that night,\nThough the frost was cruel,\nWhen a poor man came in sight,\nGathering winter fuel.",
            "\"Hither, page, and stand by me,\nIf thou know'st it, telling,\nYonder peasant, who is he?\nWhere and what his dwelling?\"\n\"Sire, he lives a good league hence,\nUnderneath the mountain;\nRight against the forest fence,\nBy Saint Agnes' fountain.\"",
            "\"Bring me flesh and bring me wine,\nBring me pine logs hither;\nThou and I will see him dine,\nWhen we bear them thither.\"\nPage and monarch forth they went,\nForth they went together;\nThrough the rude wind's wild lament\nAnd the bitter weather.",
            "\"Therefore, Christian men, be sure,\nWealth or rank possessing,\nYe who now will bless the poor,\nShall yourselves find blessing.\""
        ]
    },
    {
        id: "in_the_bleak_midwinter",
        title: "In the Bleak Midwinter",
        author: "Christina Rossetti",
        composer: "CRANHAM",
        year: "1872",
        verses: [
            "In the bleak midwinter,\nFrosty wind made moan;\nEarth stood hard as iron,\nWater like a stone;\nSnow had fallen, snow on snow,\nSnow on snow,\nIn the bleak midwinter, long ago.",
            "Our God, heaven cannot hold Him,\nNor earth sustain;\nHeaven and earth shall flee away\nWhen He comes to reign:\nIn the bleak midwinter\nA stable-place sufficed\nThe Lord God Almighty, Jesus Christ.",
            "Angels and archangels\nMay have gathered there,\nCherubim and seraphim\nThronged the air;\nBut His mother only,\nIn her maiden bliss,\nWorshipped the Beloved with a kiss.",
            "What can I give Him,\nPoor as I am?\nIf I were a shepherd,\nI would bring a lamb;\nIf I were a wise man,\nI would do my part;\nYet what I can I give Him, give my heart."
        ]
    },
    {
        id: "go_tell_it",
        title: "Go, Tell It on the Mountain",
        author: "John W. Work Jr.",
        composer: "GO TELL IT",
        year: "1909",
        chorus: "Go, tell it on the mountain,\nOver the hills and everywhere;\nGo, tell it on the mountain,\nThat Jesus Christ is born!",
        verses: [
            "While shepherds kept their watching\nO'er silent flocks by night,\nBehold, throughout the heavens\nThere shone a holy light.",
            "The shepherds feared and trembled\nWhen lo! above the earth\nRang out the angel chorus\nThat hailed our Saviour's birth.",
            "Down in a lowly manger\nThe humble Christ was born,\nAnd God sent us salvation\nThat blessed Christmas morn."
        ]
    },
    {
        id: "o_holy_night",
        title: "O Holy Night",
        author: "Placide Cappeau, tr. John S. Dwight",
        composer: "CANTIQUE DE NOËL",
        year: "1847",
        verses: [
            "O holy night! the stars are brightly shining;\nIt is the night of the dear Saviour's birth.\nLong lay the world in sin and error pining,\nTill He appeared and the soul felt its worth.\nA thrill of hope, the weary world rejoices,\nFor yonder breaks a new and glorious morn.",
            "Fall on your knees! O hear the angel voices!\nO night divine, O night when Christ was born!\nO night divine, O night, O night divine!",
            "Led by the light of faith serenely beaming,\nWith glowing hearts by His cradle we stand;\nSo led by light of a star sweetly gleaming,\nHere came the wise men from Orient land.\nThe King of kings lay thus in lowly manger,\nIn all our trials born to be our Friend.",
            "Truly He taught us to love one another;\nHis law is love and His gospel is peace.\nChains shall He break, for the slave is our brother,\nAnd in His name all oppression shall cease.\nSweet hymns of joy in grateful chorus raise we;\nLet all within us praise His holy name."
        ]
    },
    {
        id: "angels_from_realms",
        title: "Angels, from the Realms of Glory",
        author: "James Montgomery",
        composer: "REGENT SQUARE",
        year: "1816",
        chorus: "Come and worship, come and worship,\nWorship Christ, the newborn King!",
        verses: [
            "Angels, from the realms of glory,\nWing your flight o'er all the earth;\nYe who sang creation's story,\nNow proclaim Messiah's birth:",
            "Shepherds, in the fields abiding,\nWatching o'er your flocks by night,\nGod with man is now residing,\nYonder shines the infant light:",
            "Sages, leave your contemplations,\nBrighter visions beam afar;\nSeek the great Desire of nations,\nYe have seen His natal star:",
            "Saints, before the altar bending,\nWatching long in hope and fear,\nSuddenly the Lord, descending,\nIn His temple shall appear:",
            "All creation, join in praising\nGod the Father, Spirit, Son;\nEvermore your voices raising\nTo the eternal Three in One:"
        ]
    },
    {
        id: "while_shepherds_watched",
        title: "While Shepherds Watched Their Flocks",
        author: "Nahum Tate",
        composer: "WINCHESTER OLD",
        year: "1700",
        verses: [
            "While shepherds watched their flocks by night,\nAll seated on the ground,\nThe angel of the Lord came down,\nAnd glory shone around.",
            "\"Fear not,\" said he, for mighty dread\nHad seized their troubled mind;\n\"Glad tidings of great joy I bring\nTo you and all mankind.\"",
            "\"To you, in David's town, this day\nIs born of David's line\nA Saviour, who is Christ the Lord;\nAnd this shall be the sign:",
            "\"The heavenly Babe you there shall find\nTo human view displayed,\nAll meanly wrapped in swathing bands,\nAnd in a manger laid.\"",
            "\"All glory be to God on high,\nAnd to the earth be peace;\nGood will henceforth from heaven to men\nBegin and never cease.\""
        ]
    },
    {
        id: "as_with_gladness",
        title: "As with Gladness Men of Old",
        author: "William Chatterton Dix",
        composer: "DIX",
        year: "1860",
        verses: [
            "As with gladness men of old\nDid the guiding star behold;\nAs with joy they hailed its light,\nLeading onward, beaming bright;\nSo, most gracious Lord, may we\nEvermore be led to Thee.",
            "As with joyful steps they sped\nTo that lowly manger bed,\nThere to bend the knee before\nHim whom heaven and earth adore;\nSo may we with willing feet\nEver seek Thy mercy seat.",
            "As they offered gifts most rare\nAt that manger rude and bare;\nSo may we with holy joy,\nPure and free from sin's alloy,\nAll our costliest treasures bring,\nChrist, to Thee, our heavenly King.",
            "Holy Jesus, every day\nKeep us in the narrow way;\nAnd, when earthly things are past,\nBring our ransomed souls at last\nWhere they need no star to guide,\nWhere no clouds Thy glory hide."
        ]
    },
    {
        id: "the_holly_and_ivy",
        title: "The Holly and the Ivy",
        author: "Traditional English",
        composer: "THE HOLLY AND THE IVY",
        year: "1861",
        chorus: "The rising of the sun\nAnd the running of the deer,\nThe playing of the merry organ,\nSweet singing in the choir.",
        verses: [
            "The holly and the ivy,\nWhen they are both full grown,\nOf all the trees that are in the wood,\nThe holly bears the crown.",
            "The holly bears a blossom,\nAs white as lily flower,\nAnd Mary bore sweet Jesus Christ,\nTo be our sweet Saviour.",
            "The holly bears a berry,\nAs red as any blood,\nAnd Mary bore sweet Jesus Christ\nTo do poor sinners good.",
            "The holly bears a prickle,\nAs sharp as any thorn,\nAnd Mary bore sweet Jesus Christ\nOn Christmas Day in the morn.",
            "The holly bears a bark,\nAs bitter as any gall,\nAnd Mary bore sweet Jesus Christ\nFor to redeem us all."
        ]
    },
    {
        id: "ding_dong",
        title: "Ding Dong! Merrily on High",
        author: "George Ratcliffe Woodward",
        composer: "DING DONG",
        year: "1924",
        chorus: "Gloria, hosanna in excelsis!",
        verses: [
            "Ding dong! merrily on high\nIn heaven the bells are ringing;\nDing dong! verily the sky\nIs riv'n with angel singing.",
            "E'en so here below, below,\nLet steeple bells be swungen,\nAnd i-o, i-o, i-o\nBy priest and people be sungen.",
            "Pray ye dutifully prime\nYour matin chime, ye ringers;\nMay ye beautifully rime\nYour evetime song, ye singers."
        ]
    },
    {
        id: "i_saw_three_ships",
        title: "I Saw Three Ships",
        author: "Traditional English",
        composer: "I SAW THREE SHIPS",
        year: "1833",
        verses: [
            "I saw three ships come sailing in\nOn Christmas Day, on Christmas Day;\nI saw three ships come sailing in\nOn Christmas Day in the morning.",
            "And what was in those ships all three\nOn Christmas Day, on Christmas Day?\nAnd what was in those ships all three\nOn Christmas Day in the morning?",
            "Our Saviour Christ and His lady\nOn Christmas Day, on Christmas Day;\nOur Saviour Christ and His lady\nOn Christmas Day in the morning.",
            "Then let us all rejoice amain\nOn Christmas Day, on Christmas Day;\nThen let us all rejoice amain\nOn Christmas Day in the morning."
        ]
    },
    {
        id: "infant_holy",
        title: "Infant Holy, Infant Lowly",
        author: "Traditional Polish, tr. Edith M. G. Reed",
        composer: "W ZLOBIE LEZY",
        year: "1921",
        verses: [
            "Infant holy, infant lowly,\nFor His bed a cattle stall;\nOxen lowing, little knowing\nChrist the Babe is Lord of all.\nSwift are winging angels singing,\nNoels ringing, tidings bringing:\nChrist the Babe is Lord of all.",
            "Flocks were sleeping, shepherds keeping\nVigil till the morning new;\nSaw the glory, heard the story,\nTidings of a gospel true.\nThus rejoicing, free from sorrow,\nPraises voicing, greet the morrow:\nChrist the Babe was born for you."
        ]
    },
    {
        id: "of_the_fathers_love",
        title: "Of the Father's Love Begotten",
        author: "Aurelius Prudentius, tr. Neale & Baker",
        composer: "DIVINUM MYSTERIUM",
        year: "1854",
        verses: [
            "Of the Father's love begotten,\nEre the worlds began to be,\nHe is Alpha and Omega,\nHe the source, the ending He,\nOf the things that are, that have been,\nAnd that future years shall see,\nEvermore and evermore.",
            "O that birth for ever blessed,\nWhen the Virgin, full of grace,\nBy the Holy Ghost conceiving,\nBare the Saviour of our race;\nAnd the Babe, the world's Redeemer,\nFirst revealed His sacred face,\nEvermore and evermore.",
            "O ye heights of heaven, adore Him;\nAngel hosts, His praises sing;\nPowers, dominions, bow before Him,\nAnd extol our God and King;\nLet no tongue on earth be silent,\nEvery voice in concert ring,\nEvermore and evermore.",
            "Christ, to Thee, with God the Father,\nAnd, O Holy Ghost, to Thee,\nHymn and chant and high thanksgiving\nAnd unwearied praises be,\nHonour, glory, and dominion,\nAnd eternal victory,\nEvermore and evermore."
        ]
    },
    {
        id: "good_christian_men",
        title: "Good Christian Men, Rejoice",
        author: "Heinrich Seuse, tr. John M. Neale",
        composer: "IN DULCI JUBILO",
        year: "1853",
        verses: [
            "Good Christian men, rejoice,\nWith heart and soul and voice;\nGive ye heed to what we say:\nJesus Christ is born today!\nOx and ass before Him bow,\nAnd He is in the manger now.\nChrist is born today!\nChrist is born today!",
            "Good Christian men, rejoice,\nWith heart and soul and voice;\nNow ye hear of endless bliss:\nJesus Christ was born for this!\nHe hath oped the heavenly door,\nAnd man is blessed evermore.\nChrist was born for this!\nChrist was born for this!",
            "Good Christian men, rejoice,\nWith heart and soul and voice;\nNow ye need not fear the grave:\nJesus Christ was born to save!\nCalls you one and calls you all\nTo gain His everlasting hall.\nChrist was born to save!\nChrist was born to save!"
        ]
    },
    {
        id: "lo_how_a_rose",
        title: "Lo, How a Rose E'er Blooming",
        author: "German, 15th c., tr. Theodore Baker",
        composer: "ES IST EIN ROS",
        year: "1894",
        verses: [
            "Lo, how a Rose e'er blooming\nFrom tender stem hath sprung!\nOf Jesse's lineage coming,\nAs men of old have sung.\nIt came, a floweret bright,\nAmid the cold of winter,\nWhen half spent was the night.",
            "Isaiah 'twas foretold it,\nThe Rose I have in mind;\nWith Mary we behold it,\nThe virgin mother kind.\nTo show God's love aright,\nShe bore to men a Saviour,\nWhen half spent was the night.",
            "This Flower, whose fragrance tender\nWith sweetness fills the air,\nDispels with glorious splendour\nThe darkness everywhere.\nTrue man, yet very God,\nFrom sin and death He saves us,\nAnd lightens every load."
        ]
    },
    {
        id: "still_still_still",
        title: "Still, Still, Still",
        author: "Traditional Austrian",
        composer: "STILL, STILL, STILL",
        year: "1865",
        verses: [
            "Still, still, still,\nLet all the world be still;\nThe angels sing a lullaby\nTo God's own Son in manger high.\nStill, still, still,\nLet all the world be still.",
            "Sleep, sleep, sleep,\nO holy Child, now sleep;\nThy mother holds Thee to her breast,\nThe little King in swaddling dressed.\nSleep, sleep, sleep,\nO holy Child, now sleep.",
            "Love, love, love,\nO send us love above;\nOur hearts we give to Thee this night,\nO fill us with Thy heavenly light.\nLove, love, love,\nO send us love above."
        ]
    },
    {
        id: "see_amid_the_winters_snow",
        title: "See, Amid the Winter's Snow",
        author: "Edward Caswall",
        composer: "HUMILITY",
        year: "1851",
        chorus: "Come and see, come and see,\nCome and see the King of love;\nSee the gentle Lamb of God\nIn a manger laid.",
        verses: [
            "See, amid the winter's snow,\nBorn for us on earth below,\nSee the tender Lamb appears,\nPromised from eternal years.",
            "Lo, within a manger lies\nHe who built the starry skies;\nHe who, throned in height sublime,\nSits amid the cherubim.",
            "Say, ye holy shepherds, say,\nWhat your joyful news today?\nWherefore have ye left your sheep\nOn the lonely mountain steep?",
            "Sacred Infant, all divine,\nWhat a tender love was Thine,\nThus to come from highest bliss\nDown to such a world as this.",
            "Teach, O teach us, holy Child,\nBy Thy face so meek and mild,\nTeach us to resemble Thee\nIn Thy sweet humility."
        ]
    },
    {
        id: "christians_awake",
        title: "Christians, Awake, Salute the Happy Morn",
        author: "John Byrom",
        composer: "YORKSHIRE",
        year: "1773",
        verses: [
            "Christians, awake, salute the happy morn,\nWhereon the Saviour of the world was born;\nRise to adore the mystery of love,\nWhich hosts of angels chanted from above;\nWith them the joyful tidings first begun\nOf God incarnate and the virgin's Son.",
            "Then to the watchful shepherds it was told,\nWho heard the angelic herald's voice: \"Behold,\nI bring good tidings of a Saviour's birth\nTo you and all the nations upon earth;\nThis day hath God fulfilled His promised word,\nThis day is born a Saviour, Christ the Lord.\"",
            "Let us, like them, without more words, away,\nAnd see this wondrous mystery displayed;\nThen let us join with one accord to raise\nOur songs of gladness and our hymns of praise;\nAnd thus with grateful hearts and voices sing\nThe praises of our new-born Lord and King."
        ]
    },
    {
        id: "brightest_and_best",
        title: "Brightest and Best of the Sons of the Morning",
        author: "Reginald Heber",
        composer: "STAR IN THE EAST",
        year: "1811",
        chorus: "Hail the blest morn! see the great Mediator\nDown from the regions of glory descend!",
        verses: [
            "Brightest and best of the sons of the morning,\nDawn on our darkness, and lend us thine aid;\nStar of the east, the horizon adorning,\nGuide where our infant Redeemer is laid.",
            "Cold on His cradle the dewdrops are shining;\nLow lies His head with the beasts of the stall;\nAngels adore Him in slumber reclining,\nMaker and Monarch and Saviour of all.",
            "Say, shall we yield Him, in costly devotion,\nOdours of Edom, and offerings divine,\nGems of the mountain, and pearls of the ocean,\nMyrrh from the forest, or gold from the mine?",
            "Vainly we offer each ample oblation;\nVainly with gifts would His favour secure;\nRicher by far is the heart's adoration;\nDearer to God are the prayers of the poor."
        ]
    },
    {
        id: "o_come_little_children",
        title: "O Come, Little Children",
        author: "Christoph von Schmid, tr. John C. Wilcox",
        composer: "IHR KINDERLEIN, KOMMET",
        year: "1883",
        verses: [
            "O come, little children, O come, one and all,\nCome gather around Him in Bethlehem's stall;\nAnd see in His manger, so peaceful and mild,\nThe dear little Saviour, the sweet holy Child.",
            "O see in the manger so hallowed and bright,\nThe Child that is born on this good Christmas night;\nThough wrapped in poor swaddling clothes, lowly He lies,\nYet glory eternal shines out from His eyes.",
            "O come, little children, and kneel by His side,\nAnd bring Him your hearts, for He is your Guide;\nHe loves little children, He calls them His own,\nAnd leads them at last to His heavenly throne."
        ]
    },
    {
        id: "come_thou_long_expected",
        title: "Come, Thou Long-Expected Jesus",
        author: "Charles Wesley",
        composer: "HYFRYDOL",
        year: "1744",
        verses: [
            "Come, Thou long-expected Jesus,\nBorn to set Thy people free;\nFrom our fears and sins release us,\nLet us find our rest in Thee.\nIsrael's Strength and Consolation,\nHope of all the earth Thou art;\nDear Desire of every nation,\nJoy of every longing heart.",
            "Born Thy people to deliver,\nBorn a child and yet a King,\nBorn to reign in us for ever,\nNow Thy gracious kingdom bring.\nBy Thine own eternal Spirit\nRule in all our hearts alone;\nBy Thine all-sufficient merit\nRaise us to Thy glorious throne."
        ]
    },
    {
        id: "joyful_joyful",
        title: "Joyful, Joyful, We Adore Thee",
        author: "Henry van Dyke",
        composer: "HYMN TO JOY",
        year: "1907",
        verses: [
            "Joyful, joyful, we adore Thee,\nGod of glory, Lord of love;\nHearts unfold like flowers before Thee,\nOpening to the sun above.\nMelt the clouds of sin and sadness,\nDrive the dark of doubt away;\nGiver of immortal gladness,\nFill us with the light of day!",
            "All Thy works with joy surround Thee,\nEarth and heaven reflect Thy rays,\nStars and angels sing around Thee,\nCentre of unbroken praise;\nField and forest, vale and mountain,\nFlowery meadow, flashing sea,\nChanting bird and flowing fountain,\nCall us to rejoice in Thee.",
            "Thou art giving and forgiving,\nEver blessing, ever blest,\nWellspring of the joy of living,\nOcean depth of happy rest!\nThou our Father, Christ our Brother,\nAll who live in love are Thine;\nTeach us how to love each other,\nLift us to the joy divine.",
            "Mortals, join the mighty chorus\nWhich the morning stars began;\nFather love is reigning o'er us,\nBrother love binds man to man.\nEver singing, march we onward,\nVictors in the midst of strife;\nJoyful music lifts us sunward\nIn the triumph song of life."
        ]
    }
]

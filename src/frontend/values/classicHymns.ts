// Beacon Worship — the world's most-sung classic hymns.
// All texts first published before 1929 and therefore public domain.
import type { LibrarySong } from "./songLibrary"

export const CLASSIC_HYMNS: LibrarySong[] = [
    {
        id: "amazing_grace",
        title: "Amazing Grace",
        author: "John Newton",
        composer: "NEW BRITAIN",
        year: "1779",
        verses: [
            "Amazing grace! how sweet the sound,\nThat saved a wretch like me!\nI once was lost, but now am found,\nWas blind, but now I see.",
            "'Twas grace that taught my heart to fear,\nAnd grace my fears relieved;\nHow precious did that grace appear\nThe hour I first believed!",
            "Through many dangers, toils and snares,\nI have already come;\n'Tis grace hath brought me safe thus far,\nAnd grace will lead me home.",
            "The Lord has promised good to me,\nHis word my hope secures;\nHe will my shield and portion be\nAs long as life endures.",
            "When we've been there ten thousand years,\nBright shining as the sun,\nWe've no less days to sing God's praise\nThan when we'd first begun."
        ]
    },
    {
        id: "holy_holy_holy",
        title: "Holy, Holy, Holy! Lord God Almighty",
        author: "Reginald Heber",
        composer: "NICAEA",
        year: "1826",
        verses: [
            "Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee;\nHoly, holy, holy! merciful and mighty!\nGod in three Persons, blessed Trinity!",
            "Holy, holy, holy! all the saints adore Thee,\nCasting down their golden crowns around the glassy sea;\nCherubim and seraphim falling down before Thee,\nWhich wert, and art, and evermore shalt be.",
            "Holy, holy, holy! though the darkness hide Thee,\nThough the eye of sinful man Thy glory may not see,\nOnly Thou art holy; there is none beside Thee\nPerfect in power, in love, and purity.",
            "Holy, holy, holy! Lord God Almighty!\nAll Thy works shall praise Thy name, in earth, and sky, and sea;\nHoly, holy, holy! merciful and mighty!\nGod in three Persons, blessed Trinity!"
        ]
    },
    {
        id: "be_thou_my_vision",
        title: "Be Thou My Vision",
        author: "Irish, 8th c., tr. Mary Byrne & Eleanor Hull",
        composer: "SLANE",
        year: "1912",
        verses: [
            "Be Thou my Vision, O Lord of my heart;\nNaught be all else to me, save that Thou art;\nThou my best thought, by day or by night,\nWaking or sleeping, Thy presence my light.",
            "Be Thou my Wisdom, and Thou my true Word;\nI ever with Thee and Thou with me, Lord;\nThou my great Father, I Thy true son;\nThou in me dwelling, and I with Thee one.",
            "Riches I heed not, nor man's empty praise,\nThou mine inheritance, now and always;\nThou and Thou only, first in my heart,\nHigh King of heaven, my treasure Thou art.",
            "High King of heaven, my victory won,\nMay I reach heaven's joys, O bright heaven's Sun!\nHeart of my own heart, whatever befall,\nStill be my Vision, O Ruler of all."
        ]
    },
    {
        id: "come_thou_fount",
        title: "Come, Thou Fount of Every Blessing",
        author: "Robert Robinson",
        composer: "NETTLETON",
        year: "1758",
        verses: [
            "Come, Thou Fount of every blessing,\nTune my heart to sing Thy grace;\nStreams of mercy, never ceasing,\nCall for songs of loudest praise.\nTeach me some melodious sonnet,\nSung by flaming tongues above;\nPraise the mount! I'm fixed upon it,\nMount of Thy redeeming love.",
            "Here I raise mine Ebenezer;\nHither by Thy help I'm come;\nAnd I hope, by Thy good pleasure,\nSafely to arrive at home.\nJesus sought me when a stranger,\nWandering from the fold of God;\nHe, to rescue me from danger,\nInterposed His precious blood.",
            "O to grace how great a debtor\nDaily I'm constrained to be!\nLet Thy goodness, like a fetter,\nBind my wandering heart to Thee.\nProne to wander, Lord, I feel it,\nProne to leave the God I love;\nHere's my heart, O take and seal it,\nSeal it for Thy courts above."
        ]
    },
    {
        id: "it_is_well",
        title: "It Is Well with My Soul",
        author: "Horatio G. Spafford",
        composer: "VILLE DU HAVRE",
        year: "1873",
        chorus: "It is well with my soul,\nIt is well, it is well with my soul.",
        verses: [
            "When peace like a river attendeth my way,\nWhen sorrows like sea billows roll;\nWhatever my lot, Thou hast taught me to say,\n\"It is well, it is well with my soul.\"",
            "Though Satan should buffet, though trials should come,\nLet this blest assurance control,\nThat Christ hath regarded my helpless estate,\nAnd hath shed His own blood for my soul.",
            "My sin—O the bliss of this glorious thought!—\nMy sin, not in part but the whole,\nIs nailed to the cross, and I bear it no more;\nPraise the Lord, praise the Lord, O my soul!",
            "And, Lord, haste the day when my faith shall be sight,\nThe clouds be rolled back as a scroll;\nThe trump shall resound and the Lord shall descend;\nEven so, it is well with my soul."
        ]
    },
    {
        id: "blessed_assurance",
        title: "Blessed Assurance",
        author: "Fanny J. Crosby",
        composer: "ASSURANCE",
        year: "1873",
        chorus: "This is my story, this is my song,\nPraising my Saviour all the day long;\nThis is my story, this is my song,\nPraising my Saviour all the day long.",
        verses: [
            "Blessed assurance, Jesus is mine!\nO what a foretaste of glory divine!\nHeir of salvation, purchase of God,\nBorn of His Spirit, washed in His blood.",
            "Perfect submission, perfect delight,\nVisions of rapture now burst on my sight;\nAngels descending bring from above\nEchoes of mercy, whispers of love.",
            "Perfect submission, all is at rest,\nI in my Saviour am happy and blest;\nWatching and waiting, looking above,\nFilled with His goodness, lost in His love."
        ]
    },
    {
        id: "what_a_friend",
        title: "What a Friend We Have in Jesus",
        author: "Joseph M. Scriven",
        composer: "CONVERSE",
        year: "1855",
        verses: [
            "What a Friend we have in Jesus,\nAll our sins and griefs to bear!\nWhat a privilege to carry\nEverything to God in prayer!\nO what peace we often forfeit,\nO what needless pain we bear,\nAll because we do not carry\nEverything to God in prayer!",
            "Have we trials and temptations?\nIs there trouble anywhere?\nWe should never be discouraged;\nTake it to the Lord in prayer.\nCan we find a friend so faithful\nWho will all our sorrows share?\nJesus knows our every weakness;\nTake it to the Lord in prayer.",
            "Are we weak and heavy laden,\nCumbered with a load of care?\nPrecious Saviour, still our refuge;\nTake it to the Lord in prayer.\nDo thy friends despise, forsake thee?\nTake it to the Lord in prayer;\nIn His arms He'll take and shield thee,\nThou wilt find a solace there."
        ]
    },
    {
        id: "rock_of_ages",
        title: "Rock of Ages",
        author: "Augustus M. Toplady",
        composer: "TOPLADY",
        year: "1776",
        verses: [
            "Rock of Ages, cleft for me,\nLet me hide myself in Thee;\nLet the water and the blood,\nFrom Thy riven side which flowed,\nBe of sin the double cure,\nSave from wrath and make me pure.",
            "Not the labours of my hands\nCan fulfil Thy law's demands;\nCould my zeal no respite know,\nCould my tears for ever flow,\nAll for sin could not atone;\nThou must save, and Thou alone.",
            "Nothing in my hand I bring,\nSimply to Thy cross I cling;\nNaked, come to Thee for dress;\nHelpless, look to Thee for grace;\nFoul, I to the fountain fly;\nWash me, Saviour, or I die.",
            "While I draw this fleeting breath,\nWhen mine eyes shall close in death,\nWhen I soar to worlds unknown,\nSee Thee on Thy judgment throne,\nRock of Ages, cleft for me,\nLet me hide myself in Thee."
        ]
    },
    {
        id: "to_god_be_the_glory",
        title: "To God Be the Glory",
        author: "Fanny J. Crosby",
        composer: "TO GOD BE THE GLORY",
        year: "1875",
        chorus: "Praise the Lord, praise the Lord,\nLet the earth hear His voice!\nPraise the Lord, praise the Lord,\nLet the people rejoice!\nO come to the Father, through Jesus the Son,\nAnd give Him the glory, great things He hath done.",
        verses: [
            "To God be the glory, great things He hath done;\nSo loved He the world that He gave us His Son,\nWho yielded His life an atonement for sin,\nAnd opened the life gate that all may go in.",
            "O perfect redemption, the purchase of blood,\nTo every believer the promise of God;\nThe vilest offender who truly believes,\nThat moment from Jesus a pardon receives.",
            "Great things He hath taught us, great things He hath done,\nAnd great our rejoicing through Jesus the Son;\nBut purer, and higher, and greater will be\nOur wonder, our transport, when Jesus we see."
        ]
    },
    {
        id: "a_mighty_fortress",
        title: "A Mighty Fortress Is Our God",
        author: "Martin Luther, tr. Frederick H. Hedge",
        composer: "EIN FESTE BURG",
        year: "1529",
        verses: [
            "A mighty fortress is our God,\nA bulwark never failing;\nOur helper He amid the flood\nOf mortal ills prevailing.\nFor still our ancient foe\nDoth seek to work us woe;\nHis craft and power are great,\nAnd, armed with cruel hate,\nOn earth is not his equal.",
            "Did we in our own strength confide,\nOur striving would be losing;\nWere not the right man on our side,\nThe man of God's own choosing.\nDost ask who that may be?\nChrist Jesus, it is He;\nLord Sabaoth His name,\nFrom age to age the same,\nAnd He must win the battle.",
            "And though this world, with devils filled,\nShould threaten to undo us,\nWe will not fear, for God hath willed\nHis truth to triumph through us.\nThe prince of darkness grim,\nWe tremble not for him;\nHis rage we can endure,\nFor lo, his doom is sure;\nOne little word shall fell him.",
            "That word above all earthly powers,\nNo thanks to them, abideth;\nThe Spirit and the gifts are ours\nThrough Him who with us sideth.\nLet goods and kindred go,\nThis mortal life also;\nThe body they may kill;\nGod's truth abideth still;\nHis kingdom is for ever."
        ]
    },
    {
        id: "abide_with_me",
        title: "Abide with Me",
        author: "Henry F. Lyte",
        composer: "EVENTIDE",
        year: "1847",
        verses: [
            "Abide with me; fast falls the eventide;\nThe darkness deepens; Lord, with me abide;\nWhen other helpers fail and comforts flee,\nHelp of the helpless, O abide with me.",
            "Swift to its close ebbs out life's little day;\nEarth's joys grow dim, its glories pass away;\nChange and decay in all around I see;\nO Thou who changest not, abide with me.",
            "I need Thy presence every passing hour;\nWhat but Thy grace can foil the tempter's power?\nWho, like Thyself, my guide and stay can be?\nThrough cloud and sunshine, Lord, abide with me.",
            "I fear no foe, with Thee at hand to bless;\nIlls have no weight, and tears no bitterness;\nWhere is death's sting? where, grave, thy victory?\nI triumph still, if Thou abide with me.",
            "Hold Thou Thy cross before my closing eyes;\nShine through the gloom and point me to the skies;\nHeaven's morning breaks, and earth's vain shadows flee;\nIn life, in death, O Lord, abide with me."
        ]
    },
    {
        id: "all_hail_the_power",
        title: "All Hail the Power of Jesus' Name",
        author: "Edward Perronet",
        composer: "DIADEM",
        year: "1779",
        verses: [
            "All hail the power of Jesus' name!\nLet angels prostrate fall;\nBring forth the royal diadem,\nAnd crown Him Lord of all;\nBring forth the royal diadem,\nAnd crown Him Lord of all.",
            "Ye chosen seed of Israel's race,\nYe ransomed from the fall,\nHail Him who saves you by His grace,\nAnd crown Him Lord of all;\nHail Him who saves you by His grace,\nAnd crown Him Lord of all.",
            "Let every kindred, every tribe,\nOn this terrestrial ball,\nTo Him all majesty ascribe,\nAnd crown Him Lord of all;\nTo Him all majesty ascribe,\nAnd crown Him Lord of all.",
            "O that with yonder sacred throng\nWe at His feet may fall;\nWe'll join the everlasting song,\nAnd crown Him Lord of all;\nWe'll join the everlasting song,\nAnd crown Him Lord of all."
        ]
    },
    {
        id: "crown_him",
        title: "Crown Him with Many Crowns",
        author: "Matthew Bridges & Godfrey Thring",
        composer: "DIADEMATA",
        year: "1851",
        verses: [
            "Crown Him with many crowns,\nThe Lamb upon His throne;\nHark! how the heavenly anthem drowns\nAll music but its own.\nAwake, my soul, and sing\nOf Him who died for thee,\nAnd hail Him as thy matchless King\nThrough all eternity.",
            "Crown Him the Lord of life,\nWho triumphed o'er the grave,\nAnd rose victorious in the strife\nFor those He came to save.\nHis glories now we sing,\nWho died and rose on high,\nWho died eternal life to bring,\nAnd lives that death may die.",
            "Crown Him the Lord of love;\nBehold His hands and side,\nRich wounds, yet visible above,\nIn beauty glorified.\nNo angel in the sky\nCan fully bear that sight,\nBut downward bends his wondering eye\nAt mysteries so bright.",
            "Crown Him the Lord of heaven,\nEnthroned in worlds above;\nCrown Him the King to whom is given\nThe wondrous name of Love.\nCrown Him with many crowns,\nAs thrones before Him fall;\nCrown Him, ye kings, with many crowns,\nFor He is King of all."
        ]
    },
    {
        id: "when_i_survey",
        title: "When I Survey the Wondrous Cross",
        author: "Isaac Watts",
        composer: "ROCKINGHAM",
        year: "1707",
        verses: [
            "When I survey the wondrous cross\nOn which the Prince of glory died,\nMy richest gain I count but loss,\nAnd pour contempt on all my pride.",
            "Forbid it, Lord, that I should boast,\nSave in the death of Christ my God;\nAll the vain things that charm me most,\nI sacrifice them to His blood.",
            "See from His head, His hands, His feet,\nSorrow and love flow mingled down;\nDid e'er such love and sorrow meet,\nOr thorns compose so rich a crown?",
            "Were the whole realm of nature mine,\nThat were a present far too small;\nLove so amazing, so divine,\nDemands my soul, my life, my all."
        ]
    },
    {
        id: "there_is_a_fountain",
        title: "There Is a Fountain Filled with Blood",
        author: "William Cowper",
        composer: "CLEANSING FOUNTAIN",
        year: "1772",
        verses: [
            "There is a fountain filled with blood\nDrawn from Emmanuel's veins;\nAnd sinners plunged beneath that flood\nLose all their guilty stains,\nLose all their guilty stains,\nLose all their guilty stains;\nAnd sinners plunged beneath that flood\nLose all their guilty stains.",
            "The dying thief rejoiced to see\nThat fountain in his day;\nAnd there have I, though vile as he,\nWashed all my sins away,\nWashed all my sins away,\nWashed all my sins away;\nAnd there have I, though vile as he,\nWashed all my sins away.",
            "Dear dying Lamb, Thy precious blood\nShall never lose its power,\nTill all the ransomed church of God\nBe saved, to sin no more,\nBe saved, to sin no more,\nBe saved, to sin no more;\nTill all the ransomed church of God\nBe saved, to sin no more.",
            "E'er since by faith I saw the stream\nThy flowing wounds supply,\nRedeeming love has been my theme,\nAnd shall be till I die,\nAnd shall be till I die,\nAnd shall be till I die;\nRedeeming love has been my theme,\nAnd shall be till I die."
        ]
    },
    {
        id: "jesus_paid_it_all",
        title: "Jesus Paid It All",
        author: "Elvina M. Hall",
        composer: "ALL TO CHRIST",
        year: "1865",
        chorus: "Jesus paid it all,\nAll to Him I owe;\nSin had left a crimson stain,\nHe washed it white as snow.",
        verses: [
            "I hear the Saviour say,\n\"Thy strength indeed is small;\nChild of weakness, watch and pray,\nFind in Me thine all in all.\"",
            "Lord, now indeed I find\nThy power, and Thine alone,\nCan change the leper's spots\nAnd melt the heart of stone.",
            "For nothing good have I\nWhereby Thy grace to claim;\nI'll wash my garments white\nIn the blood of Calvary's Lamb.",
            "And when before the throne\nI stand in Him complete,\n\"Jesus died my soul to save,\"\nMy lips shall still repeat."
        ]
    },
    {
        id: "nothing_but_the_blood",
        title: "Nothing but the Blood",
        author: "Robert Lowry",
        composer: "PLAINFIELD",
        year: "1876",
        chorus: "O precious is the flow\nThat makes me white as snow;\nNo other fount I know,\nNothing but the blood of Jesus.",
        verses: [
            "What can wash away my sin?\nNothing but the blood of Jesus;\nWhat can make me whole again?\nNothing but the blood of Jesus.",
            "For my pardon this I see,\nNothing but the blood of Jesus;\nFor my cleansing this my plea,\nNothing but the blood of Jesus.",
            "Nothing can for sin atone,\nNothing but the blood of Jesus;\nNaught of good that I have done,\nNothing but the blood of Jesus.",
            "This is all my hope and peace,\nNothing but the blood of Jesus;\nThis is all my righteousness,\nNothing but the blood of Jesus."
        ]
    },
    {
        id: "trust_and_obey",
        title: "Trust and Obey",
        author: "John H. Sammis",
        composer: "TRUST AND OBEY",
        year: "1887",
        chorus: "Trust and obey, for there's no other way\nTo be happy in Jesus, but to trust and obey.",
        verses: [
            "When we walk with the Lord\nIn the light of His word,\nWhat a glory He sheds on our way!\nWhile we do His good will,\nHe abides with us still,\nAnd with all who will trust and obey.",
            "Not a shadow can rise,\nNot a cloud in the skies,\nBut His smile quickly drives it away;\nNot a doubt nor a fear,\nNot a sigh nor a tear,\nCan abide while we trust and obey.",
            "Not a burden we bear,\nNot a sorrow we share,\nBut our toil He doth richly repay;\nNot a grief nor a loss,\nNot a frown nor a cross,\nBut is blest if we trust and obey.",
            "Then in fellowship sweet\nWe will sit at His feet,\nOr we'll walk by His side in the way;\nWhat He says we will do,\nWhere He sends we will go;\nNever fear, only trust and obey."
        ]
    },
    {
        id: "tis_so_sweet",
        title: "'Tis So Sweet to Trust in Jesus",
        author: "Louisa M. R. Stead",
        composer: "TRUST IN JESUS",
        year: "1882",
        chorus: "Jesus, Jesus, how I trust Him!\nHow I've proved Him o'er and o'er!\nJesus, Jesus, precious Jesus!\nO for grace to trust Him more!",
        verses: [
            "'Tis so sweet to trust in Jesus,\nJust to take Him at His word;\nJust to rest upon His promise,\nJust to know, \"Thus saith the Lord.\"",
            "O how sweet to trust in Jesus,\nJust to trust His cleansing blood;\nJust in simple faith to plunge me\n'Neath the healing, cleansing flood!",
            "Yes, 'tis sweet to trust in Jesus,\nJust from sin and self to cease;\nJust from Jesus simply taking\nLife and rest, and joy and peace.",
            "I'm so glad I learned to trust Thee,\nPrecious Jesus, Saviour, Friend;\nAnd I know that Thou art with me,\nWilt be with me to the end."
        ]
    },
    {
        id: "leaning",
        title: "Leaning on the Everlasting Arms",
        author: "Elisha A. Hoffman",
        composer: "SHOWALTER",
        year: "1887",
        chorus: "Leaning, leaning,\nSafe and secure from all alarms;\nLeaning, leaning,\nLeaning on the everlasting arms.",
        verses: [
            "What a fellowship, what a joy divine,\nLeaning on the everlasting arms;\nWhat a blessedness, what a peace is mine,\nLeaning on the everlasting arms.",
            "O how sweet to walk in this pilgrim way,\nLeaning on the everlasting arms;\nO how bright the path grows from day to day,\nLeaning on the everlasting arms.",
            "What have I to dread, what have I to fear,\nLeaning on the everlasting arms?\nI have blessed peace with my Lord so near,\nLeaning on the everlasting arms."
        ]
    }
]

// ——— Part 2: appended below and merged into CLASSIC_HYMNS ———
const MORE_HYMNS: LibrarySong[] = [
    {
        id: "standing_on_the_promises",
        title: "Standing on the Promises",
        author: "R. Kelso Carter",
        composer: "PROMISES",
        year: "1886",
        chorus: "Standing, standing,\nStanding on the promises of God my Saviour;\nStanding, standing,\nI'm standing on the promises of God.",
        verses: [
            "Standing on the promises of Christ my King,\nThrough eternal ages let His praises ring;\nGlory in the highest I will shout and sing,\nStanding on the promises of God.",
            "Standing on the promises that cannot fail,\nWhen the howling storms of doubt and fear assail,\nBy the living word of God I shall prevail,\nStanding on the promises of God.",
            "Standing on the promises I now can see\nPerfect, present cleansing in the blood for me;\nStanding in the liberty where Christ makes free,\nStanding on the promises of God.",
            "Standing on the promises I cannot fall,\nListening every moment to the Spirit's call,\nResting in my Saviour as my all in all,\nStanding on the promises of God."
        ]
    },
    {
        id: "great_is_thy_faithfulness",
        title: "Great Is Thy Faithfulness",
        author: "Thomas O. Chisholm",
        composer: "FAITHFULNESS",
        year: "1923",
        chorus: "Great is Thy faithfulness! Great is Thy faithfulness!\nMorning by morning new mercies I see;\nAll I have needed Thy hand hath provided;\nGreat is Thy faithfulness, Lord, unto me!",
        verses: [
            "Great is Thy faithfulness, O God my Father;\nThere is no shadow of turning with Thee;\nThou changest not, Thy compassions, they fail not;\nAs Thou hast been, Thou for ever wilt be.",
            "Summer and winter and springtime and harvest,\nSun, moon and stars in their courses above\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy and love.",
            "Pardon for sin and a peace that endureth,\nThine own dear presence to cheer and to guide;\nStrength for today and bright hope for tomorrow,\nBlessings all mine, with ten thousand beside!"
        ]
    },
    {
        id: "guide_me_o",
        title: "Guide Me, O Thou Great Jehovah",
        author: "William Williams, tr. Peter Williams",
        composer: "CWM RHONDDA",
        year: "1745",
        verses: [
            "Guide me, O Thou great Jehovah,\nPilgrim through this barren land;\nI am weak, but Thou art mighty;\nHold me with Thy powerful hand;\nBread of heaven, bread of heaven,\nFeed me till I want no more,\nFeed me till I want no more.",
            "Open now the crystal fountain,\nWhence the healing stream doth flow;\nLet the fire and cloudy pillar\nLead me all my journey through;\nStrong Deliverer, strong Deliverer,\nBe Thou still my strength and shield,\nBe Thou still my strength and shield.",
            "When I tread the verge of Jordan,\nBid my anxious fears subside;\nDeath of death, and hell's Destruction,\nLand me safe on Canaan's side;\nSongs of praises, songs of praises,\nI will ever give to Thee,\nI will ever give to Thee."
        ]
    },
    {
        id: "immortal_invisible",
        title: "Immortal, Invisible, God Only Wise",
        author: "Walter Chalmers Smith",
        composer: "ST. DENIO",
        year: "1867",
        verses: [
            "Immortal, invisible, God only wise,\nIn light inaccessible hid from our eyes,\nMost blessed, most glorious, the Ancient of Days,\nAlmighty, victorious, Thy great name we praise.",
            "Unresting, unhasting, and silent as light,\nNor wanting, nor wasting, Thou rulest in might;\nThy justice, like mountains, high soaring above\nThy clouds, which are fountains of goodness and love.",
            "To all, life Thou givest, to both great and small;\nIn all life Thou livest, the true life of all;\nWe blossom and flourish as leaves on the tree,\nAnd wither and perish, but naught changeth Thee.",
            "Great Father of glory, pure Father of light,\nThine angels adore Thee, all veiling their sight;\nAll laud we would render; O help us to see\n'Tis only the splendour of light hideth Thee."
        ]
    },
    {
        id: "praise_to_the_lord",
        title: "Praise to the Lord, the Almighty",
        author: "Joachim Neander, tr. Catherine Winkworth",
        composer: "LOBE DEN HERREN",
        year: "1680",
        verses: [
            "Praise to the Lord, the Almighty, the King of creation!\nO my soul, praise Him, for He is thy health and salvation!\nAll ye who hear, now to His temple draw near;\nJoin me in glad adoration!",
            "Praise to the Lord, who o'er all things so wondrously reigneth,\nShieldeth thee under His wings, yea, so gently sustaineth!\nHast thou not seen how thy desires e'er have been\nGranted in what He ordaineth?",
            "Praise to the Lord, who doth prosper thy work and defend thee;\nSurely His goodness and mercy here daily attend thee.\nPonder anew what the Almighty can do,\nIf with His love He befriend thee.",
            "Praise to the Lord! O let all that is in me adore Him!\nAll that hath life and breath, come now with praises before Him!\nLet the Amen sound from His people again;\nGladly for aye we adore Him."
        ]
    },
    {
        id: "all_creatures",
        title: "All Creatures of Our God and King",
        author: "St. Francis of Assisi, tr. William H. Draper",
        composer: "LASST UNS ERFREUEN",
        year: "1919",
        verses: [
            "All creatures of our God and King,\nLift up your voice and with us sing,\nAlleluia! Alleluia!\nThou burning sun with golden beam,\nThou silver moon with softer gleam,\nO praise Him, O praise Him,\nAlleluia! Alleluia! Alleluia!",
            "Thou rushing wind that art so strong,\nYe clouds that sail in heaven along,\nO praise Him! Alleluia!\nThou rising morn, in praise rejoice,\nYe lights of evening, find a voice,\nO praise Him, O praise Him,\nAlleluia! Alleluia! Alleluia!",
            "Dear mother earth, who day by day\nUnfoldest blessings on our way,\nO praise Him! Alleluia!\nThe flowers and fruits that in thee grow,\nLet them His glory also show,\nO praise Him, O praise Him,\nAlleluia! Alleluia! Alleluia!",
            "Let all things their Creator bless,\nAnd worship Him in humbleness,\nO praise Him! Alleluia!\nPraise, praise the Father, praise the Son,\nAnd praise the Spirit, Three in One,\nO praise Him, O praise Him,\nAlleluia! Alleluia! Alleluia!"
        ]
    },
    {
        id: "for_the_beauty",
        title: "For the Beauty of the Earth",
        author: "Folliott S. Pierpoint",
        composer: "DIX",
        year: "1864",
        chorus: "Christ our God, to Thee we raise\nThis our hymn of grateful praise.",
        verses: [
            "For the beauty of the earth,\nFor the glory of the skies,\nFor the love which from our birth\nOver and around us lies;",
            "For the beauty of each hour\nOf the day and of the night,\nHill and vale, and tree and flower,\nSun and moon, and stars of light;",
            "For the joy of human love,\nBrother, sister, parent, child,\nFriends on earth and friends above,\nFor all gentle thoughts and mild;",
            "For Thy church, that evermore\nLifteth holy hands above,\nOffering up on every shore\nHer pure sacrifice of love;"
        ]
    },
    {
        id: "come_ye_thankful",
        title: "Come, Ye Thankful People, Come",
        author: "Henry Alford",
        composer: "ST. GEORGE'S WINDSOR",
        year: "1844",
        verses: [
            "Come, ye thankful people, come,\nRaise the song of harvest home;\nAll is safely gathered in,\nEre the winter storms begin;\nGod, our Maker, doth provide\nFor our wants to be supplied;\nCome to God's own temple, come,\nRaise the song of harvest home.",
            "All the world is God's own field,\nFruit unto His praise to yield;\nWheat and tares together sown,\nUnto joy or sorrow grown;\nFirst the blade, and then the ear,\nThen the full corn shall appear;\nLord of harvest, grant that we\nWholesome grain and pure may be.",
            "For the Lord our God shall come,\nAnd shall take His harvest home;\nFrom His field shall in that day\nAll offences purge away;\nGive His angels charge at last\nIn the fire the tares to cast;\nBut the fruitful ears to store\nIn His garner evermore.",
            "Even so, Lord, quickly come,\nBring Thy final harvest home;\nGather Thou Thy people in,\nFree from sorrow, free from sin;\nThere, for ever purified,\nIn Thy garner to abide;\nCome, with all Thine angels, come,\nRaise the glorious harvest home."
        ]
    },
    {
        id: "now_thank_we_all",
        title: "Now Thank We All Our God",
        author: "Martin Rinkart, tr. Catherine Winkworth",
        composer: "NUN DANKET",
        year: "1636",
        verses: [
            "Now thank we all our God\nWith heart and hands and voices,\nWho wondrous things hath done,\nIn whom His world rejoices;\nWho from our mothers' arms\nHath blessed us on our way\nWith countless gifts of love,\nAnd still is ours today.",
            "O may this bounteous God\nThrough all our life be near us,\nWith ever joyful hearts\nAnd blessed peace to cheer us;\nAnd keep us in His grace,\nAnd guide us when perplexed,\nAnd free us from all ills\nIn this world and the next.",
            "All praise and thanks to God\nThe Father now be given,\nThe Son, and Him who reigns\nWith them in highest heaven,\nThe one eternal God,\nWhom earth and heaven adore;\nFor thus it was, is now,\nAnd shall be evermore."
        ]
    },
    {
        id: "praise_my_soul",
        title: "Praise, My Soul, the King of Heaven",
        author: "Henry F. Lyte",
        composer: "LAUDA ANIMA",
        year: "1834",
        verses: [
            "Praise, my soul, the King of heaven;\nTo His feet thy tribute bring;\nRansomed, healed, restored, forgiven,\nWho like thee His praise should sing?\nPraise Him, praise Him,\nPraise Him, praise Him,\nPraise the everlasting King.",
            "Praise Him for His grace and favour\nTo our fathers in distress;\nPraise Him, still the same for ever,\nSlow to chide, and swift to bless;\nPraise Him, praise Him,\nPraise Him, praise Him,\nGlorious in His faithfulness.",
            "Father-like, He tends and spares us;\nWell our feeble frame He knows;\nIn His hands He gently bears us,\nRescues us from all our foes;\nPraise Him, praise Him,\nPraise Him, praise Him,\nWidely as His mercy flows.",
            "Angels, help us to adore Him;\nYe behold Him face to face;\nSun and moon, bow down before Him;\nDwellers all in time and space;\nPraise Him, praise Him,\nPraise Him, praise Him,\nPraise with us the God of grace."
        ]
    },
    {
        id: "o_worship_the_king",
        title: "O Worship the King",
        author: "Robert Grant",
        composer: "LYONS",
        year: "1833",
        verses: [
            "O worship the King, all glorious above,\nAnd gratefully sing His power and His love;\nOur Shield and Defender, the Ancient of Days,\nPavilioned in splendour, and girded with praise.",
            "O tell of His might, O sing of His grace,\nWhose robe is the light, whose canopy space;\nHis chariots of wrath the deep thunderclouds form,\nAnd dark is His path on the wings of the storm.",
            "Thy bountiful care, what tongue can recite?\nIt breathes in the air, it shines in the light;\nIt streams from the hills, it descends to the plain,\nAnd sweetly distils in the dew and the rain.",
            "Frail children of dust, and feeble as frail,\nIn Thee do we trust, nor find Thee to fail;\nThy mercies, how tender, how firm to the end,\nOur Maker, Defender, Redeemer, and Friend!"
        ]
    },
    {
        id: "love_divine",
        title: "Love Divine, All Loves Excelling",
        author: "Charles Wesley",
        composer: "HYFRYDOL",
        year: "1747",
        verses: [
            "Love divine, all loves excelling,\nJoy of heaven, to earth come down;\nFix in us Thy humble dwelling,\nAll Thy faithful mercies crown.\nJesus, Thou art all compassion,\nPure unbounded love Thou art;\nVisit us with Thy salvation,\nEnter every trembling heart.",
            "Breathe, O breathe Thy loving Spirit\nInto every troubled breast;\nLet us all in Thee inherit,\nLet us find that second rest.\nTake away our bent to sinning,\nAlpha and Omega be;\nEnd of faith, as its beginning,\nSet our hearts at liberty.",
            "Come, Almighty to deliver,\nLet us all Thy life receive;\nSuddenly return, and never,\nNever more Thy temples leave.\nThee we would be always blessing,\nServe Thee as Thy hosts above,\nPray, and praise Thee without ceasing,\nGlory in Thy perfect love.",
            "Finish then Thy new creation,\nPure and spotless let us be;\nLet us see Thy great salvation\nPerfectly restored in Thee;\nChanged from glory into glory,\nTill in heaven we take our place,\nTill we cast our crowns before Thee,\nLost in wonder, love, and praise."
        ]
    },
    {
        id: "and_can_it_be",
        title: "And Can It Be That I Should Gain",
        author: "Charles Wesley",
        composer: "SAGINA",
        year: "1738",
        chorus: "Amazing love! how can it be\nThat Thou, my God, shouldst die for me?",
        verses: [
            "And can it be that I should gain\nAn interest in the Saviour's blood?\nDied He for me, who caused His pain?\nFor me, who Him to death pursued?",
            "He left His Father's throne above,\nSo free, so infinite His grace;\nEmptied Himself of all but love,\nAnd bled for Adam's helpless race.",
            "No condemnation now I dread;\nJesus, and all in Him, is mine!\nAlive in Him, my living Head,\nAnd clothed in righteousness divine."
        ]
    },
    {
        id: "o_for_a_thousand",
        title: "O for a Thousand Tongues to Sing",
        author: "Charles Wesley",
        composer: "AZMON",
        year: "1739",
        verses: [
            "O for a thousand tongues to sing\nMy great Redeemer's praise,\nThe glories of my God and King,\nThe triumphs of His grace!",
            "My gracious Master and my God,\nAssist me to proclaim,\nTo spread through all the earth abroad\nThe honours of Thy name.",
            "Jesus! the name that charms our fears,\nThat bids our sorrows cease;\n'Tis music in the sinner's ears,\n'Tis life, and health, and peace.",
            "He breaks the power of cancelled sin,\nHe sets the prisoner free;\nHis blood can make the foulest clean,\nHis blood availed for me.",
            "Hear Him, ye deaf; His praise, ye dumb,\nYour loosened tongues employ;\nYe blind, behold your Saviour come;\nAnd leap, ye lame, for joy."
        ]
    },
    {
        id: "jesus_lover_of_my_soul",
        title: "Jesus, Lover of My Soul",
        author: "Charles Wesley",
        composer: "ABERYSTWYTH",
        year: "1740",
        verses: [
            "Jesus, Lover of my soul,\nLet me to Thy bosom fly,\nWhile the nearer waters roll,\nWhile the tempest still is high;\nHide me, O my Saviour, hide,\nTill the storm of life is past;\nSafe into the haven guide,\nO receive my soul at last.",
            "Other refuge have I none;\nHangs my helpless soul on Thee;\nLeave, ah! leave me not alone,\nStill support and comfort me.\nAll my trust on Thee is stayed,\nAll my help from Thee I bring;\nCover my defenceless head\nWith the shadow of Thy wing.",
            "Thou, O Christ, art all I want;\nMore than all in Thee I find;\nRaise the fallen, cheer the faint,\nHeal the sick, and lead the blind.\nJust and holy is Thy name,\nI am all unrighteousness;\nFalse and full of sin I am,\nThou art full of truth and grace.",
            "Plenteous grace with Thee is found,\nGrace to cover all my sin;\nLet the healing streams abound;\nMake and keep me pure within.\nThou of life the fountain art,\nFreely let me take of Thee;\nSpring Thou up within my heart,\nRise to all eternity."
        ]
    },
    {
        id: "christ_the_lord_is_risen",
        title: "Christ the Lord Is Risen Today",
        author: "Charles Wesley",
        composer: "EASTER HYMN",
        year: "1739",
        verses: [
            "Christ the Lord is risen today, Alleluia!\nSons of men and angels say, Alleluia!\nRaise your joys and triumphs high, Alleluia!\nSing, ye heavens, and earth reply, Alleluia!",
            "Lives again our glorious King, Alleluia!\nWhere, O death, is now thy sting? Alleluia!\nOnce He died our souls to save, Alleluia!\nWhere thy victory, O grave? Alleluia!",
            "Love's redeeming work is done, Alleluia!\nFought the fight, the battle won, Alleluia!\nDeath in vain forbids Him rise, Alleluia!\nChrist hath opened paradise, Alleluia!",
            "Soar we now where Christ hath led, Alleluia!\nFollowing our exalted Head, Alleluia!\nMade like Him, like Him we rise, Alleluia!\nOurs the cross, the grave, the skies, Alleluia!"
        ]
    },
    {
        id: "thine_be_the_glory",
        title: "Thine Be the Glory",
        author: "Edmond Budry, tr. R. Birch Hoyle",
        composer: "MACCABEUS",
        year: "1884",
        chorus: "Thine be the glory, risen, conquering Son;\nEndless is the victory Thou o'er death hast won.",
        verses: [
            "Thine be the glory, risen, conquering Son;\nEndless is the victory Thou o'er death hast won.\nAngels in bright raiment rolled the stone away,\nKept the folded grave-clothes where Thy body lay.",
            "Lo! Jesus meets us, risen from the tomb;\nLovingly He greets us, scatters fear and gloom.\nLet the church with gladness hymns of triumph sing,\nFor her Lord now liveth; death hath lost its sting.",
            "No more we doubt Thee, glorious Prince of life!\nLife is naught without Thee; aid us in our strife.\nMake us more than conquerors through Thy deathless love;\nBring us safe through Jordan to Thy home above."
        ]
    },
    {
        id: "i_surrender_all",
        title: "I Surrender All",
        author: "Judson W. Van DeVenter",
        composer: "SURRENDER",
        year: "1896",
        chorus: "I surrender all, I surrender all;\nAll to Thee, my blessed Saviour,\nI surrender all.",
        verses: [
            "All to Jesus I surrender,\nAll to Him I freely give;\nI will ever love and trust Him,\nIn His presence daily live.",
            "All to Jesus I surrender,\nHumbly at His feet I bow;\nWorldly pleasures all forsaken,\nTake me, Jesus, take me now.",
            "All to Jesus I surrender,\nMake me, Saviour, wholly Thine;\nLet me feel the Holy Spirit,\nTruly know that Thou art mine.",
            "All to Jesus I surrender,\nNow I feel the sacred flame;\nO the joy of full salvation!\nGlory, glory to His name!"
        ]
    },
    {
        id: "take_my_life",
        title: "Take My Life and Let It Be",
        author: "Frances R. Havergal",
        composer: "HENDON",
        year: "1874",
        verses: [
            "Take my life, and let it be\nConsecrated, Lord, to Thee;\nTake my moments and my days,\nLet them flow in ceaseless praise,\nLet them flow in ceaseless praise.",
            "Take my hands, and let them move\nAt the impulse of Thy love;\nTake my feet, and let them be\nSwift and beautiful for Thee,\nSwift and beautiful for Thee.",
            "Take my voice, and let me sing\nAlways, only, for my King;\nTake my lips, and let them be\nFilled with messages from Thee,\nFilled with messages from Thee.",
            "Take my silver and my gold,\nNot a mite would I withhold;\nTake my intellect, and use\nEvery power as Thou shalt choose,\nEvery power as Thou shalt choose.",
            "Take my will, and make it Thine;\nIt shall be no longer mine;\nTake my heart, it is Thine own;\nIt shall be Thy royal throne,\nIt shall be Thy royal throne.",
            "Take my love; my Lord, I pour\nAt Thy feet its treasure store;\nTake myself, and I will be\nEver, only, all for Thee,\nEver, only, all for Thee."
        ]
    }
]

CLASSIC_HYMNS.push(...MORE_HYMNS)

// ——— Part 3 ———
const EVEN_MORE_HYMNS: LibrarySong[] = [
    {
        id: "just_as_i_am",
        title: "Just As I Am",
        author: "Charlotte Elliott",
        composer: "WOODWORTH",
        year: "1835",
        verses: [
            "Just as I am, without one plea,\nBut that Thy blood was shed for me,\nAnd that Thou bidd'st me come to Thee,\nO Lamb of God, I come, I come.",
            "Just as I am, and waiting not\nTo rid my soul of one dark blot,\nTo Thee, whose blood can cleanse each spot,\nO Lamb of God, I come, I come.",
            "Just as I am, though tossed about\nWith many a conflict, many a doubt,\nFightings and fears within, without,\nO Lamb of God, I come, I come.",
            "Just as I am, poor, wretched, blind;\nSight, riches, healing of the mind,\nYea, all I need, in Thee to find,\nO Lamb of God, I come, I come.",
            "Just as I am, Thou wilt receive,\nWilt welcome, pardon, cleanse, relieve;\nBecause Thy promise I believe,\nO Lamb of God, I come, I come."
        ]
    },
    {
        id: "nearer_my_god",
        title: "Nearer, My God, to Thee",
        author: "Sarah F. Adams",
        composer: "BETHANY",
        year: "1841",
        verses: [
            "Nearer, my God, to Thee, nearer to Thee!\nE'en though it be a cross that raiseth me;\nStill all my song shall be,\nNearer, my God, to Thee,\nNearer, my God, to Thee, nearer to Thee!",
            "Though like the wanderer, the sun gone down,\nDarkness be over me, my rest a stone;\nYet in my dreams I'd be\nNearer, my God, to Thee,\nNearer, my God, to Thee, nearer to Thee!",
            "There let the way appear, steps unto heaven;\nAll that Thou sendest me, in mercy given;\nAngels to beckon me\nNearer, my God, to Thee,\nNearer, my God, to Thee, nearer to Thee!",
            "Then, with my waking thoughts bright with Thy praise,\nOut of my stony griefs Bethel I'll raise;\nSo by my woes to be\nNearer, my God, to Thee,\nNearer, my God, to Thee, nearer to Thee!"
        ]
    },
    {
        id: "i_need_thee",
        title: "I Need Thee Every Hour",
        author: "Annie S. Hawks",
        composer: "NEED",
        year: "1872",
        chorus: "I need Thee, O I need Thee;\nEvery hour I need Thee;\nO bless me now, my Saviour,\nI come to Thee!",
        verses: [
            "I need Thee every hour, most gracious Lord;\nNo tender voice like Thine can peace afford.",
            "I need Thee every hour; stay Thou near by;\nTemptations lose their power when Thou art nigh.",
            "I need Thee every hour, in joy or pain;\nCome quickly and abide, or life is vain.",
            "I need Thee every hour; teach me Thy will;\nAnd Thy rich promises in me fulfil.",
            "I need Thee every hour, most Holy One;\nO make me Thine indeed, Thou blessed Son."
        ]
    },
    {
        id: "sweet_hour",
        title: "Sweet Hour of Prayer",
        author: "William W. Walford",
        composer: "SWEET HOUR",
        year: "1845",
        verses: [
            "Sweet hour of prayer! sweet hour of prayer!\nThat calls me from a world of care,\nAnd bids me at my Father's throne\nMake all my wants and wishes known;\nIn seasons of distress and grief,\nMy soul has often found relief,\nAnd oft escaped the tempter's snare\nBy thy return, sweet hour of prayer!",
            "Sweet hour of prayer! sweet hour of prayer!\nThy wings shall my petition bear\nTo Him whose truth and faithfulness\nEngage the waiting soul to bless;\nAnd since He bids me seek His face,\nBelieve His word and trust His grace,\nI'll cast on Him my every care,\nAnd wait for thee, sweet hour of prayer!",
            "Sweet hour of prayer! sweet hour of prayer!\nMay I thy consolation share,\nTill, from Mount Pisgah's lofty height,\nI view my home and take my flight:\nThis robe of flesh I'll drop, and rise\nTo seize the everlasting prize;\nAnd shout, while passing through the air,\nFarewell, farewell, sweet hour of prayer!"
        ]
    },
    {
        id: "what_a_wonderful_saviour",
        title: "My Jesus, I Love Thee",
        author: "William R. Featherstone",
        composer: "GORDON",
        year: "1864",
        verses: [
            "My Jesus, I love Thee, I know Thou art mine;\nFor Thee all the follies of sin I resign;\nMy gracious Redeemer, my Saviour art Thou;\nIf ever I loved Thee, my Jesus, 'tis now.",
            "I love Thee because Thou hast first loved me,\nAnd purchased my pardon on Calvary's tree;\nI love Thee for wearing the thorns on Thy brow;\nIf ever I loved Thee, my Jesus, 'tis now.",
            "I'll love Thee in life, I will love Thee in death,\nAnd praise Thee as long as Thou lendest me breath;\nAnd say when the death-dew lies cold on my brow,\nIf ever I loved Thee, my Jesus, 'tis now.",
            "In mansions of glory and endless delight,\nI'll ever adore Thee in heaven so bright;\nI'll sing with the glittering crown on my brow,\nIf ever I loved Thee, my Jesus, 'tis now."
        ]
    },
    {
        id: "pass_me_not",
        title: "Pass Me Not, O Gentle Saviour",
        author: "Fanny J. Crosby",
        composer: "PASS ME NOT",
        year: "1868",
        chorus: "Saviour, Saviour, hear my humble cry;\nWhile on others Thou art calling,\nDo not pass me by.",
        verses: [
            "Pass me not, O gentle Saviour,\nHear my humble cry;\nWhile on others Thou art calling,\nDo not pass me by.",
            "Let me at Thy throne of mercy\nFind a sweet relief;\nKneeling there in deep contrition,\nHelp my unbelief.",
            "Trusting only in Thy merit,\nWould I seek Thy face;\nHeal my wounded, broken spirit,\nSave me by Thy grace.",
            "Thou the spring of all my comfort,\nMore than life to me;\nWhom have I on earth beside Thee?\nWhom in heaven but Thee?"
        ]
    },
    {
        id: "all_the_way",
        title: "All the Way My Saviour Leads Me",
        author: "Fanny J. Crosby",
        composer: "ALL THE WAY",
        year: "1875",
        verses: [
            "All the way my Saviour leads me;\nWhat have I to ask beside?\nCan I doubt His tender mercy,\nWho through life has been my guide?\nHeavenly peace, divinest comfort,\nHere by faith in Him to dwell!\nFor I know whate'er befall me,\nJesus doeth all things well;\nFor I know whate'er befall me,\nJesus doeth all things well.",
            "All the way my Saviour leads me;\nCheers each winding path I tread,\nGives me grace for every trial,\nFeeds me with the living bread.\nThough my weary steps may falter,\nAnd my soul athirst may be,\nGushing from the Rock before me,\nLo! a spring of joy I see;\nGushing from the Rock before me,\nLo! a spring of joy I see.",
            "All the way my Saviour leads me;\nO the fulness of His love!\nPerfect rest to me is promised\nIn my Father's house above.\nWhen my spirit, clothed immortal,\nWings its flight to realms of day,\nThis my song through endless ages:\nJesus led me all the way;\nThis my song through endless ages:\nJesus led me all the way."
        ]
    },
    {
        id: "near_the_cross",
        title: "Jesus, Keep Me Near the Cross",
        author: "Fanny J. Crosby",
        composer: "NEAR THE CROSS",
        year: "1869",
        chorus: "In the cross, in the cross,\nBe my glory ever;\nTill my raptured soul shall find\nRest beyond the river.",
        verses: [
            "Jesus, keep me near the cross;\nThere a precious fountain,\nFree to all, a healing stream,\nFlows from Calvary's mountain.",
            "Near the cross, a trembling soul,\nLove and mercy found me;\nThere the Bright and Morning Star\nShed its beams around me.",
            "Near the cross! O Lamb of God,\nBring its scenes before me;\nHelp me walk from day to day\nWith its shadow o'er me.",
            "Near the cross I'll watch and wait,\nHoping, trusting ever,\nTill I reach the golden strand\nJust beyond the river."
        ]
    },
    {
        id: "safe_in_the_arms",
        title: "Safe in the Arms of Jesus",
        author: "Fanny J. Crosby",
        composer: "SAFE IN THE ARMS",
        year: "1868",
        chorus: "Safe in the arms of Jesus,\nSafe on His gentle breast,\nThere by His love o'ershaded,\nSweetly my soul shall rest.",
        verses: [
            "Safe in the arms of Jesus,\nSafe on His gentle breast,\nThere by His love o'ershaded,\nSweetly my soul shall rest.\nHark! 'tis the voice of angels\nBorne in a song to me,\nOver the fields of glory,\nOver the jasper sea.",
            "Safe in the arms of Jesus,\nSafe from corroding care,\nSafe from the world's temptations,\nSin cannot harm me there.\nFree from the blight of sorrow,\nFree from my doubts and fears;\nOnly a few more trials,\nOnly a few more tears.",
            "Jesus, my heart's dear refuge,\nJesus has died for me;\nFirm on the Rock of Ages\nEver my trust shall be.\nHere let me wait with patience,\nWait till the night is o'er;\nWait till I see the morning\nBreak on the golden shore."
        ]
    },
    {
        id: "more_love_to_thee",
        title: "More Love to Thee, O Christ",
        author: "Elizabeth P. Prentiss",
        composer: "MORE LOVE TO THEE",
        year: "1856",
        verses: [
            "More love to Thee, O Christ,\nMore love to Thee!\nHear Thou the prayer I make\nOn bended knee;\nThis is my earnest plea:\nMore love, O Christ, to Thee,\nMore love to Thee, more love to Thee!",
            "Once earthly joy I craved,\nSought peace and rest;\nNow Thee alone I seek,\nGive what is best;\nThis all my prayer shall be:\nMore love, O Christ, to Thee,\nMore love to Thee, more love to Thee!",
            "Then shall my latest breath\nWhisper Thy praise;\nThis be the parting cry\nMy heart shall raise;\nThis still its prayer shall be:\nMore love, O Christ, to Thee,\nMore love to Thee, more love to Thee!"
        ]
    },
    {
        id: "have_thine_own_way",
        title: "Have Thine Own Way, Lord",
        author: "Adelaide A. Pollard",
        composer: "ADELAIDE",
        year: "1907",
        verses: [
            "Have Thine own way, Lord! Have Thine own way!\nThou art the Potter, I am the clay;\nMould me and make me after Thy will,\nWhile I am waiting, yielded and still.",
            "Have Thine own way, Lord! Have Thine own way!\nSearch me and try me, Master, today;\nWhiter than snow, Lord, wash me just now,\nAs in Thy presence humbly I bow.",
            "Have Thine own way, Lord! Have Thine own way!\nWounded and weary, help me, I pray;\nPower, all power, surely is Thine;\nTouch me and heal me, Saviour divine.",
            "Have Thine own way, Lord! Have Thine own way!\nHold o'er my being absolute sway;\nFill with Thy Spirit till all shall see\nChrist only, always, living in me."
        ]
    },
    {
        id: "the_solid_rock",
        title: "My Hope Is Built on Nothing Less",
        author: "Edward Mote",
        composer: "THE SOLID ROCK",
        year: "1834",
        chorus: "On Christ, the solid Rock, I stand;\nAll other ground is sinking sand,\nAll other ground is sinking sand.",
        verses: [
            "My hope is built on nothing less\nThan Jesus' blood and righteousness;\nI dare not trust the sweetest frame,\nBut wholly lean on Jesus' name.",
            "When darkness veils His lovely face,\nI rest on His unchanging grace;\nIn every high and stormy gale,\nMy anchor holds within the veil.",
            "His oath, His covenant, His blood\nSupport me in the whelming flood;\nWhen all around my soul gives way,\nHe then is all my hope and stay.",
            "When He shall come with trumpet sound,\nO may I then in Him be found,\nDressed in His righteousness alone,\nFaultless to stand before the throne."
        ]
    },
    {
        id: "how_firm_a_foundation",
        title: "How Firm a Foundation",
        author: "John Rippon's Selection",
        composer: "FOUNDATION",
        year: "1787",
        verses: [
            "How firm a foundation, ye saints of the Lord,\nIs laid for your faith in His excellent word!\nWhat more can He say than to you He hath said,\nTo you who for refuge to Jesus have fled?",
            "Fear not, I am with thee, O be not dismayed,\nFor I am thy God, and will still give thee aid;\nI'll strengthen thee, help thee, and cause thee to stand,\nUpheld by My righteous, omnipotent hand.",
            "When through the deep waters I call thee to go,\nThe rivers of sorrow shall not overflow;\nFor I will be with thee, thy troubles to bless,\nAnd sanctify to thee thy deepest distress.",
            "When through fiery trials thy pathway shall lie,\nMy grace, all sufficient, shall be thy supply;\nThe flame shall not hurt thee; I only design\nThy dross to consume, and thy gold to refine.",
            "The soul that on Jesus hath leaned for repose,\nI will not, I will not desert to his foes;\nThat soul, though all hell should endeavour to shake,\nI'll never, no never, no never forsake!"
        ]
    },
    {
        id: "onward_christian_soldiers",
        title: "Onward, Christian Soldiers",
        author: "Sabine Baring-Gould",
        composer: "ST. GERTRUDE",
        year: "1865",
        chorus: "Onward, Christian soldiers, marching as to war,\nWith the cross of Jesus going on before.",
        verses: [
            "Onward, Christian soldiers, marching as to war,\nWith the cross of Jesus going on before.\nChrist, the royal Master, leads against the foe;\nForward into battle, see His banners go!",
            "Like a mighty army moves the church of God;\nBrothers, we are treading where the saints have trod.\nWe are not divided, all one body we,\nOne in hope and doctrine, one in charity.",
            "Crowns and thrones may perish, kingdoms rise and wane,\nBut the church of Jesus constant will remain.\nGates of hell can never 'gainst that church prevail;\nWe have Christ's own promise, and that cannot fail.",
            "Onward then, ye people, join our happy throng,\nBlend with ours your voices in the triumph song.\nGlory, laud and honour unto Christ the King,\nThis through countless ages men and angels sing."
        ]
    },
    {
        id: "stand_up_stand_up",
        title: "Stand Up, Stand Up for Jesus",
        author: "George Duffield Jr.",
        composer: "WEBB",
        year: "1858",
        verses: [
            "Stand up, stand up for Jesus,\nYe soldiers of the cross;\nLift high His royal banner,\nIt must not suffer loss.\nFrom victory unto victory\nHis army shall He lead,\nTill every foe is vanquished,\nAnd Christ is Lord indeed.",
            "Stand up, stand up for Jesus,\nThe trumpet call obey;\nForth to the mighty conflict\nIn this His glorious day.\nYe that are men now serve Him\nAgainst unnumbered foes;\nLet courage rise with danger,\nAnd strength to strength oppose.",
            "Stand up, stand up for Jesus,\nStand in His strength alone;\nThe arm of flesh will fail you,\nYe dare not trust your own.\nPut on the gospel armour,\nAnd watching unto prayer,\nWhere duty calls, or danger,\nBe never wanting there.",
            "Stand up, stand up for Jesus,\nThe strife will not be long;\nThis day the noise of battle,\nThe next the victor's song.\nTo him that overcometh\nA crown of life shall be;\nHe with the King of glory\nShall reign eternally."
        ]
    },
    {
        id: "the_churchs_one_foundation",
        title: "The Church's One Foundation",
        author: "Samuel J. Stone",
        composer: "AURELIA",
        year: "1866",
        verses: [
            "The church's one foundation\nIs Jesus Christ her Lord;\nShe is His new creation\nBy water and the word;\nFrom heaven He came and sought her\nTo be His holy bride;\nWith His own blood He bought her,\nAnd for her life He died.",
            "Elect from every nation,\nYet one o'er all the earth,\nHer charter of salvation\nOne Lord, one faith, one birth;\nOne holy name she blesses,\nPartakes one holy food,\nAnd to one hope she presses,\nWith every grace endued.",
            "Mid toil and tribulation,\nAnd tumult of her war,\nShe waits the consummation\nOf peace for evermore;\nTill with the vision glorious\nHer longing eyes are blest,\nAnd the great church victorious\nShall be the church at rest.",
            "Yet she on earth hath union\nWith God the Three in One,\nAnd mystic sweet communion\nWith those whose rest is won;\nO happy ones and holy!\nLord, give us grace that we,\nLike them, the meek and lowly,\nOn high may dwell with Thee."
        ]
    },
    {
        id: "blest_be_the_tie",
        title: "Blest Be the Tie That Binds",
        author: "John Fawcett",
        composer: "DENNIS",
        year: "1782",
        verses: [
            "Blest be the tie that binds\nOur hearts in Christian love;\nThe fellowship of kindred minds\nIs like to that above.",
            "Before our Father's throne\nWe pour our ardent prayers;\nOur fears, our hopes, our aims are one,\nOur comforts and our cares.",
            "We share our mutual woes,\nOur mutual burdens bear;\nAnd often for each other flows\nThe sympathizing tear.",
            "When we asunder part,\nIt gives us inward pain;\nBut we shall still be joined in heart,\nAnd hope to meet again."
        ]
    },
    {
        id: "when_the_roll",
        title: "When the Roll Is Called Up Yonder",
        author: "James M. Black",
        composer: "ROLL CALL",
        year: "1893",
        chorus: "When the roll is called up yonder,\nWhen the roll is called up yonder,\nWhen the roll is called up yonder,\nWhen the roll is called up yonder I'll be there.",
        verses: [
            "When the trumpet of the Lord shall sound,\nAnd time shall be no more,\nAnd the morning breaks, eternal, bright and fair;\nWhen the saved of earth shall gather\nOver on the other shore,\nAnd the roll is called up yonder, I'll be there.",
            "On that bright and cloudless morning\nWhen the dead in Christ shall rise,\nAnd the glory of His resurrection share;\nWhen His chosen ones shall gather\nTo their home beyond the skies,\nAnd the roll is called up yonder, I'll be there.",
            "Let us labour for the Master\nFrom the dawn till setting sun,\nLet us talk of all His wondrous love and care;\nThen, when all of life is over,\nAnd our work on earth is done,\nAnd the roll is called up yonder, I'll be there."
        ]
    },
    {
        id: "shall_we_gather",
        title: "Shall We Gather at the River",
        author: "Robert Lowry",
        composer: "HANSON PLACE",
        year: "1864",
        chorus: "Yes, we'll gather at the river,\nThe beautiful, the beautiful river;\nGather with the saints at the river\nThat flows by the throne of God.",
        verses: [
            "Shall we gather at the river,\nWhere bright angel feet have trod;\nWith its crystal tide for ever\nFlowing by the throne of God?",
            "On the margin of the river,\nWashing up its silver spray,\nWe will walk and worship ever,\nAll the happy golden day.",
            "Ere we reach the shining river,\nLay we every burden down;\nGrace our spirits will deliver,\nAnd provide a robe and crown.",
            "Soon we'll reach the shining river,\nSoon our pilgrimage will cease;\nSoon our happy hearts will quiver\nWith the melody of peace."
        ]
    },
    {
        id: "sweet_by_and_by",
        title: "Sweet By and By",
        author: "Sanford F. Bennett",
        composer: "SWEET BY AND BY",
        year: "1868",
        chorus: "In the sweet by and by,\nWe shall meet on that beautiful shore;\nIn the sweet by and by,\nWe shall meet on that beautiful shore.",
        verses: [
            "There's a land that is fairer than day,\nAnd by faith we can see it afar;\nFor the Father waits over the way,\nTo prepare us a dwelling place there.",
            "We shall sing on that beautiful shore\nThe melodious songs of the blest;\nAnd our spirits shall sorrow no more,\nNot a sigh for the blessing of rest.",
            "To our bountiful Father above,\nWe will offer our tribute of praise,\nFor the glorious gift of His love,\nAnd the blessings that hallow our days."
        ]
    },
    {
        id: "there_is_a_balm",
        title: "There Is a Balm in Gilead",
        author: "African-American spiritual",
        composer: "BALM IN GILEAD",
        year: "1854",
        chorus: "There is a balm in Gilead\nTo make the wounded whole;\nThere is a balm in Gilead\nTo heal the sin-sick soul.",
        verses: [
            "There is a balm in Gilead\nTo make the wounded whole;\nThere is a balm in Gilead\nTo heal the sin-sick soul.",
            "Sometimes I feel discouraged,\nAnd think my work's in vain,\nBut then the Holy Spirit\nRevives my soul again.",
            "If you cannot preach like Peter,\nIf you cannot pray like Paul,\nYou can tell the love of Jesus,\nAnd say He died for all.",
            "Don't ever feel discouraged,\nFor Jesus is your friend;\nAnd if you lack for knowledge,\nHe'll never refuse to lend."
        ]
    }
]

CLASSIC_HYMNS.push(...EVEN_MORE_HYMNS)

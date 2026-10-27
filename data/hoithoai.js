/*
 * Hội thoại tình huống thực tế: bên mua Việt Nam (vai "Bạn") làm việc với nhà cung cấp Trung Quốc (vai "Đối tác").
 * Mỗi câu: [vai "A" (Bạn) | "B" (Đối tác), chữ Hán, pinyin, nghĩa tiếng Việt].
 * Bản soạn đầu — nên nhờ người dùng tiếng Trung thành thạo trong ngành rà lại.
 */
(function (root) {
  var DIALOGUES = [
    {
      id: "hoi-gia",
      ten: "Hỏi giá Sorbitol lần đầu",
      boiCanh: "Bạn nhắn WeChat cho một nhà máy Sơn Đông để hỏi giá Sorbitol lỏng 70%.",
      lines: [
        ["A", "您好，我是越南的采购，想询价一下山梨醇。", "Nín hǎo, wǒ shì Yuènán de cǎigòu, xiǎng xúnjià yīxià shānlíchún.", "Chào anh, tôi là bên thu mua ở Việt Nam, muốn hỏi giá Sorbitol."],
        ["B", "您好！请问您要液体还是粉末？", "Nín hǎo! Qǐngwèn nín yào yètǐ háishi fěnmò?", "Chào chị! Xin hỏi chị cần dạng lỏng hay dạng bột?"],
        ["A", "液体，含量百分之七十，食品级。", "Yètǐ, hánliàng bǎi fēn zhī qīshí, shípǐnjí.", "Dạng lỏng, hàm lượng 70%, cấp thực phẩm."],
        ["B", "好的。一个月大概要多少？", "Hǎo de. Yí ge yuè dàgài yào duōshao?", "Vâng. Mỗi tháng chị cần khoảng bao nhiêu?"],
        ["A", "先试一个二十尺柜，以后每个月两到三个柜。", "Xiān shì yí ge èrshí chǐ guì, yǐhòu měi ge yuè liǎng dào sān ge guì.", "Trước mắt thử một container 20 feet, sau này mỗi tháng 2–3 container."],
        ["B", "明白。您要什么包装？塑料桶还是吨桶？", "Míngbai. Nín yào shénme bāozhuāng? Sùliào tǒng háishi dūntǒng?", "Hiểu rồi. Chị cần đóng gói gì? Phuy nhựa hay bồn IBC?"],
        ["A", "吨桶。请报到岸价，目的港胡志明。", "Dūntǒng. Qǐng bào dào'ànjià, mùdìgǎng Húzhìmíng.", "Bồn IBC. Vui lòng báo giá CIF, cảng đến Hồ Chí Minh."],
        ["B", "好的，我今天下午把报价单发给您。", "Hǎo de, wǒ jīntiān xiàwǔ bǎ bàojiàdān fā gěi nín.", "Vâng, chiều nay tôi gửi bảng báo giá cho chị."]
      ]
    },
    {
      id: "thong-so-mau",
      ten: "Hỏi thông số và xin mẫu",
      boiCanh: "Trước khi đặt hàng, bạn cần COA, MSDS và mẫu để khách hàng thử.",
      lines: [
        ["A", "请发一下产品的规格和分析证书。", "Qǐng fā yīxià chǎnpǐn de guīgé hé fēnxī zhèngshū.", "Vui lòng gửi thông số sản phẩm và COA."],
        ["B", "好的，安全技术说明书也需要吗？", "Hǎo de, ānquán jìshù shuōmíngshū yě xūyào ma?", "Vâng, chị có cần cả MSDS không?"],
        ["A", "需要，要英文版的。这个产品是危险品吗？", "Xūyào, yào Yīngwén bǎn de. Zhège chǎnpǐn shì wēixiǎnpǐn ma?", "Cần, bản tiếng Anh. Sản phẩm này có phải hàng nguy hiểm không?"],
        ["B", "不是，是普通货物，海运没问题。", "Bú shì, shì pǔtōng huòwù, hǎiyùn méi wèntí.", "Không, là hàng thường, đi biển không vấn đề gì."],
        ["A", "可以先寄一公斤样品吗？我们的客户要测试。", "Kěyǐ xiān jì yī gōngjīn yàngpǐn ma? Wǒmen de kèhù yào cèshì.", "Có thể gửi trước 1 kg mẫu không? Khách của chúng tôi cần thử nghiệm."],
        ["B", "样品免费，快递费需要您那边付。", "Yàngpǐn miǎnfèi, kuàidì fèi xūyào nín nàbiān fù.", "Mẫu miễn phí, phí chuyển phát bên chị chịu."],
        ["A", "没问题。保质期是多久？", "Méi wèntí. Bǎozhìqī shì duōjiǔ?", "Không vấn đề. Hạn sử dụng bao lâu?"],
        ["B", "两年，请储存在阴凉干燥处。", "Liǎng nián, qǐng chǔcún zài yīnliáng gānzào chù.", "Hai năm, vui lòng bảo quản nơi khô ráo thoáng mát."]
      ]
    },
    {
      id: "dam-phan",
      ten: "Đàm phán giá và MOQ",
      boiCanh: "Báo giá cao hơn giá đối thủ, bạn muốn xin giảm và hỏi số lượng tối thiểu.",
      lines: [
        ["A", "收到报价了，但是价格有点高。", "Shōu dào bàojià le, dànshì jiàgé yǒudiǎn gāo.", "Đã nhận báo giá, nhưng giá hơi cao."],
        ["B", "我们的质量很稳定，每批都有检测报告。", "Wǒmen de zhìliàng hěn wěndìng, měi pī dōu yǒu jiǎncè bàogào.", "Chất lượng bên tôi rất ổn định, lô nào cũng có báo cáo kiểm nghiệm."],
        ["A", "我明白，可是别的供应商便宜百分之五。", "Wǒ míngbai, kěshì bié de gōngyìngshāng piányi bǎi fēn zhī wǔ.", "Tôi hiểu, nhưng nhà cung cấp khác rẻ hơn 5%."],
        ["B", "如果您订三个柜，我可以给您百分之三的折扣。", "Rúguǒ nín dìng sān ge guì, wǒ kěyǐ gěi nín bǎi fēn zhī sān de zhékòu.", "Nếu chị đặt 3 container, tôi có thể chiết khấu 3%."],
        ["A", "最低起订量是多少？", "Zuìdī qǐdìngliàng shì duōshao?", "Số lượng đặt tối thiểu là bao nhiêu?"],
        ["B", "最低起订量是一个整柜。", "Zuìdī qǐdìngliàng shì yí ge zhěngguì.", "Tối thiểu một container nguyên."],
        ["A", "这个报价有效期多久？", "Zhège bàojià yǒuxiàoqī duōjiǔ?", "Báo giá này hiệu lực bao lâu?"],
        ["B", "七天。最近原料价格波动比较大。", "Qī tiān. Zuìjìn yuánliào jiàgé bōdòng bǐjiào dà.", "Bảy ngày. Gần đây giá nguyên liệu biến động khá mạnh."]
      ]
    },
    {
      id: "thanh-toan-giao-hang",
      ten: "Chốt thanh toán và giao hàng",
      boiCanh: "Hai bên thống nhất phương thức thanh toán, thời gian giao và chứng từ để giảm thuế.",
      lines: [
        ["A", "付款方式可以是电汇吗？", "Fùkuǎn fāngshì kěyǐ shì diànhuì ma?", "Thanh toán bằng T/T được không?"],
        ["B", "可以，百分之三十定金，余款见提单副本付清。", "Kěyǐ, bǎi fēn zhī sānshí dìngjīn, yúkuǎn jiàn tídān fùběn fùqīng.", "Được, cọc 30%, còn lại thanh toán hết khi thấy bản sao B/L."],
        ["A", "好的。收到定金后交货期多久？", "Hǎo de. Shōu dào dìngjīn hòu jiāohuòqī duōjiǔ?", "Được. Nhận cọc rồi thì bao lâu giao hàng?"],
        ["B", "大概十五天可以装柜。", "Dàgài shíwǔ tiān kěyǐ zhuāngguì.", "Khoảng 15 ngày là đóng container được."],
        ["A", "请办E表，我们可以减免关税。", "Qǐng bàn E biǎo, wǒmen kěyǐ jiǎnmiǎn guānshuì.", "Vui lòng làm C/O form E, bên tôi được giảm miễn thuế."],
        ["B", "没问题，我们会跟提单一起寄给您。", "Méi wèntí, wǒmen huì gēn tídān yìqǐ jì gěi nín.", "Không vấn đề, chúng tôi sẽ gửi kèm vận đơn cho chị."],
        ["A", "我先发形式发票，您确认后盖章回传。", "Wǒ xiān fā xíngshì fāpiào, nín quèrèn hòu gàizhāng huíchuán.", "Tôi gửi PI trước, anh xác nhận rồi đóng dấu gửi lại."]
      ]
    },
    {
      id: "dat-tau-chung-tu",
      ten: "Đặt tàu và theo dõi chứng từ",
      boiCanh: "Hàng sắp xong, bạn hỏi lịch tàu, chứng từ và telex release.",
      lines: [
        ["A", "货准备好了吗？什么时候开船？", "Huò zhǔnbèi hǎo le ma? Shénme shíhou kāichuán?", "Hàng chuẩn bị xong chưa? Khi nào tàu chạy?"],
        ["B", "货代已经订舱了，预计下周三开船。", "Huòdài yǐjīng dìngcāng le, yùjì xià zhōusān kāichuán.", "Forwarder đã đặt chỗ rồi, dự kiến thứ Tư tuần sau tàu chạy."],
        ["A", "开船后请发提单、商业发票和装箱单。", "Kāichuán hòu qǐng fā tídān, shāngyè fāpiào hé zhuāngxiāngdān.", "Tàu chạy rồi vui lòng gửi B/L, hóa đơn thương mại và phiếu đóng gói."],
        ["B", "好的。尾款收到后我们安排电放。", "Hǎo de. Wěikuǎn shōu dào hòu wǒmen ānpái diànfàng.", "Vâng. Nhận tiền còn lại xong chúng tôi làm telex release."],
        ["A", "钱已经付了，这是水单。", "Qián yǐjīng fù le, zhè shì shuǐdān.", "Tiền đã chuyển rồi, đây là chứng từ chuyển tiền."],
        ["B", "收到了，谢谢！预计到港时间是二十号。", "Shōu dào le, xièxie! Yùjì dàogǎng shíjiān shì èrshí hào.", "Đã nhận, cảm ơn chị! Dự kiến ngày 20 hàng đến cảng."]
      ]
    },
    {
      id: "khieu-nai",
      ten: "Khiếu nại hàng thiếu cân, vón cục",
      boiCanh: "Hàng về kho, bạn phát hiện thiếu trọng lượng và một phần bị vón cục.",
      lines: [
        ["A", "这批货到了，但是有质量问题。", "Zhè pī huò dào le, dànshì yǒu zhìliàng wèntí.", "Lô hàng này về rồi, nhưng có vấn đề chất lượng."],
        ["B", "什么问题？请详细说一下。", "Shénme wèntí? Qǐng xiángxì shuō yīxià.", "Vấn đề gì vậy? Chị nói chi tiết giúp tôi."],
        ["A", "每桶短重两公斤左右，还有几袋结块了。", "Měi tǒng duǎnzhòng liǎng gōngjīn zuǒyòu, hái yǒu jǐ dài jiékuài le.", "Mỗi phuy thiếu khoảng 2 kg, còn vài bao bị vón cục."],
        ["B", "非常抱歉。请发照片和视频给我们。", "Fēicháng bàoqiàn. Qǐng fā zhàopiàn hé shìpín gěi wǒmen.", "Thành thật xin lỗi. Chị gửi ảnh và video cho chúng tôi nhé."],
        ["A", "我们已经请了第三方检验，报告明天出来。", "Wǒmen yǐjīng qǐng le dì-sān fāng jiǎnyàn, bàogào míngtiān chūlái.", "Chúng tôi đã mời giám định bên thứ ba, ngày mai có báo cáo."],
        ["B", "收到报告后，我们会给您一个解决方案。", "Shōu dào bàogào hòu, wǒmen huì gěi nín yí ge jiějué fāng'àn.", "Nhận được báo cáo, chúng tôi sẽ đưa chị phương án giải quyết."],
        ["A", "希望尽快赔偿，下一批要注意包装。", "Xīwàng jǐnkuài péicháng, xià yì pī yào zhùyì bāozhuāng.", "Mong sớm bồi thường, lô sau phải chú ý đóng gói."]
      ]
    }
  ];

  var api = { DIALOGUES: DIALOGUES };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.HC_DIALOGUES = api;
})(this);

import { basekit, FieldType, field, FieldComponent, FieldCode } from '@lark-opdev/block-basekit-server-api';
const { t } = field;

const feishuDm = ['feishu.cn', 'feishucdn.com', 'larksuitecdn.com', 'larksuite.com'];
// 通过addDomainList添加请求接口的域名，不可写多个addDomainList，否则会被覆盖
basekit.addDomainList([...feishuDm]);

basekit.addField({
  // 定义捷径的i18n语言资源
  i18n: {
    messages: {
      'zh-CN': {
        'inputText': '输入文本',
        'capitalizedText': '首字母大写文本',
      },
      'en-US': {
        'inputText': 'Input Text',
        'capitalizedText': 'Capitalized Text',
      },
      'ja-JP': {
        'inputText': '入力テキスト',
        'capitalizedText': '最初の文字を大文字にする',
      },
    }
  },
  // 定义捷径的入参
  formItems: [
    {
      key: 'inputText',
      label: t('inputText'),
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.Text],
      },
      validator: {
        required: true,
      }
    },
  ],
  // 定义捷径的返回结果类型
  resultType: {
    type: FieldType.Text,
  },
  // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
  execute: async (formItemParams: { inputText: any }, context) => {
    // 从formItemParams中获取输入文本
    const inputText = formItemParams.inputText;
    
    /** 
     * 为方便查看日志，使用此方法替代console.log
     * 开发者可以直接使用这个工具函数进行日志记录
     */
    function debugLog(arg: any, showContext = false) {
      // @ts-ignore
      if (!showContext) {
        console.log(JSON.stringify({ arg, logID: context.logID }), '\n');
        return;
      }
      console.log(JSON.stringify({
        formItemParams,
        context,
        arg
      }), '\n');
    }

    // 入口第一行日志，展示formItemParams和context，方便调试
    // 每次修改版本时，都需要修改日志版本号，方便定位问题
    debugLog('=====start=====v1', true);

    try {
      // 处理输入文本，提取纯文本内容
      let text = '';
      if (Array.isArray(inputText)) {
        // 处理文本字段的复杂结构
        text = inputText.map(item => {
          if (typeof item === 'object' && item !== null && 'text' in item) {
            return item.text;
          }
          return String(item);
        }).join(' ');
      } else {
        text = String(inputText);
      }
      
      // 将文本转换为每个单词首字母大写，其他字母小写
      const capitalizedText = text
        .toLowerCase()
        .split(' ')
        .map(word => {
          if (word.length === 0) return word;
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
      
      debugLog({ inputText: text, capitalizedText });

      return {
        code: FieldCode.Success,
        data: capitalizedText
      };
    } catch (e) {
      console.log('====error', String(e));
      debugLog({
        '===999 异常错误': String(e)
      });
      /** 返回非 Success 的错误码，将会在单元格上显示报错，请勿返回msg、message之类的字段，它们并不会起作用。
       * 对于未知错误，请直接返回 FieldCode.Error，然后通过查日志来排查错误原因。
       */
      return {
        code: FieldCode.Error,
      };
    }
  },
});
export default basekit;
import { getDataSet } from "../../utils/util";
import FileUploader from "../../utils/file-uploader";

Component({
    properties: {
        // 默认展示的图片文件
        files: {
            type: Array,
            value: []
        },
        // 最大上传图片数量
        maxCount: {
            type: Number,
            value: 1
        },
        // 单个图片文件大小限制，单位 M
        size: {
            type: Number,
            value: 2
        },
        // 可选图片大小类型，original：原图，compressed：压缩图
        // 默认都可以
        sizeType: {
            type: Array,
            value: ['original', 'compressed']
        },
        // 可选图片来源，album: 从相册选图, camera：使用相机
        // 默认都可以
        sourceType: {
            type: Array,
            value: ['album', 'camera']
        },
    },
    observers: {
        files: function (newValue) {
            console.log('触发observers',newValue)
            if (!newValue.length) {
                return
            }

            const _files = []
            newValue.forEach((item, index) => {
                const file = {
                    id: item.id,
                    key: index + '',
                    path: item.path,
                    status: this.data.uploadStatusEnum.SUCCESS,
                    error: ''
                }
                _files.push(file)
            })

            console.log('_files',_files)
            this.setData({
                _files
            })
        }
    },
    data: {
        _files: [],
        uploadStatusEnum: {
            ERROR: 0,
            UPLOADING: 1,
            SUCCESS: 2
        }
    },
    methods: {
        handlePreview: function (event) {
            // 小程序 图片预览组件和上传图片组件会触发页面生命周期的 show 和 hide 影响展示
            //所以要一个标识 不让表单service-form组件 触发show 和 hide
            this.triggerEvent('hidepage')
            const index = getDataSet(event, 'index')
            const urls = this.data._files.map(item => item.path)
            wx.previewImage({
                urls: urls,
                current: urls[index]
            })
        },

        handleDelete: function (event) {
            const index = getDataSet(event, 'index')
            const deleted = this.data._files.splice(index, 1)
            this.setData({
                _files: this.data._files
            })
            this.triggerEvent('delete', { index, item: deleted[0] })
        },

        handleChooseImage: async function () {
            this.triggerEvent('hidepage')

            const res = await wx.chooseMedia({
                count: this.data.maxCount,
                sizeType: this.data.sizeType,
                sourceType: this.data.sourceType
            })

           

            this.triggerEvent('choose', { files: res.tempFiles })

            const _files = this._filesFilter(res.tempFiles)
            this.setData({
                _files
            })
            //过滤上传中的图片状态，这些才是要做图片上传的
            console.log('res.tempFiles',res.tempFiles)
            const uploadTask = _files.filter(item => item.status === this.data.uploadStatusEnum.UPLOADING);
            this._executeUpload(uploadTask)
        },

        _filesFilter(tempFiles) {
            console.log('_filesFilter初始参数',tempFiles)
            const res = []
            tempFiles.forEach((item, index) => {
           
                let error = ''
                if (item.size > (1024 * 1024 * this.data.size)) {
                    error = `图片大小不能超过${this.data.size}M`
                    console.log('图片大于2M')
                    this.triggerEvent('validatefail', { item, error })
                }
                const length = this.data._files.length;
                res.push({
                    id: null,
                    key: index + length + '', //如果分多次上传 每次上传的索引都是0所以要加个length
                    path: item.tempFilePath , //item.path
                    status: error ? this.data.uploadStatusEnum.ERROR : this.data.uploadStatusEnum.UPLOADING,
                    error: error
                })
                
            })

            console.log('this.data._files.concat(res)',this.data._files.concat(res))
            return this.data._files.concat(res)

            
        },

        async _executeUpload(uploadTask) {
          console.log('uploadTask',uploadTask)
            const success = []
            for (const file of uploadTask) {
                try {
                    const res = await FileUploader.upload(file.path, file.key);
                    file.id = res[0].id
                    file.url = res[0].path
                    file.status = this.data.uploadStatusEnum.SUCCESS
                    this.data._files[file.key] = file
                    success.push(file)
                } catch (e) {
                    file.status = this.data.uploadStatusEnum.ERROR
                    file.error = e
                    this.triggerEvent('uploadfail', { file, error: e })
                }
            }
            this.setData({
                _files: this.data._files
            })

            if (success.length) {
                this.triggerEvent('uploadsuccess', { files: success })
            }
        }
    }
});
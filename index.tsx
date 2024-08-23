import debounce from 'lodash/debounce'
import Icon from 'react-native-vector-icons/Feather'
import React from 'react'
import { Appearance, Dimensions, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

interface IAppSearchBarProps {
  editable?: boolean
  text?: string
  search?: (text?: string) => void
  asyncInstantCallback?: (text?: string) => void
  noBorder?: boolean
  placeholder?: string
  forwardedRef?: any
  onBlur?: () => void
  onFocus?: () => void
  onCancelButtonPress?: (text?: string) => void
  onSearchButtonPress?: (text?: string) => void
  async?: boolean
  autoFocus?: boolean
  keepCancelBtn?: boolean
  language?: 'ru' | 'en'
  isDarkMode?: boolean
  mainColor?: string
}

interface IAppSearchBarState {
  text: string
  showCancelButton: boolean
}

class AppSearchBar extends React.Component<IAppSearchBarProps, IAppSearchBarState> {
  Locale = {
    locale: {
      en: {
        'Поиск': 'Search',
        'Отмена': 'Cancel',
      },
      ru: {},
    } as Record<string, Record<string, string>>,
    getCurrentLocale: 'en',
    getItem(text: string, strict?: boolean): string {
      if (strict) {
        return this.locale[this.getCurrentLocale][text];
      }
      return this.locale[this.getCurrentLocale][text] || text;
    },
  };

  AppConfig = {
    iOS: Platform.OS === 'ios',
    android: Platform.OS === 'android',
    // @ts-ignore
    mac: Platform.isMacCatalyst,
    get isPad() {
      return this.windowWidth > 767 || this.mac;
    },
    windowWidth: Dimensions.get('window').width,
    windowHeight: Dimensions.get('window').height,
    get dark() {
      return Appearance.getColorScheme() === 'dark'
    },
    searchDebounce: 1000,
    mainColor: '#222222',
    get titleColor() {
      return this.dark ? '#FAFAFA' : '#444444';
    },
    get borderColor() {
      return this.dark ? '#313131' : '#DDDDDD';
    },
  };

  styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: this.AppConfig.android ? 56 : 52,
      marginTop: this.AppConfig.android ? 2 : 0,
      alignItems: 'center'
    },

    inputView: {
      flex: 1,
      height: this.AppConfig.android ? 40 : 34,
      borderRadius: 8,
      paddingHorizontal: 9,
      justifyContent: 'center' as const
    },

    inputText: {
      fontSize: 16,
      fontFamily: 'TTNorms-Medium'
    },
  })

  state = {
    text: this.props.text || '',
    showCancelButton: false
  }

  private textInput

  searchFocus = () => {
    if (this.textInput.current) {
      this.textInput.current.focus()
    }
  }

  searchBlur = () => {
    if (this.textInput.current) {
      if (this.AppConfig.iOS) {
        this.textInput.current.blur()
        // this.searchBar.current.unFocus()
      } else {
        this.textInput.current.blur()
      }
    }
  }

  componentDidMount() {
    this.AppConfig.mainColor = this.props?.mainColor || (this.AppConfig.dark ? '#87DC84' : '#049A00')
    if (this.props.forwardedRef) {
      this.textInput = this.props.forwardedRef
    } else {
      this.textInput = React.createRef<TextInput>()
    }

    if (this.props.autoFocus) {
      this.searchFocus()
    }

    if (this.props.language) {
      this.Locale.getCurrentLocale = this.props.language
      this.forceUpdate()
    }
  }

  componentDidUpdate(prevProps: Readonly<IAppSearchBarProps>) {
    if(prevProps.text !== this.props.text){
      this.setState({text: this.props.text})
    }
  }

  componentWillUnmount() {
    this.search.cancel()
  }

  onCancelButtonPress = () => {
    this.clearInput()
    if (this.textInput.current) {
      this.textInput.current.blur()
    }
    if (this.props.onCancelButtonPress) {
      this.props.onCancelButtonPress()
    }
    if (this.props.keepCancelBtn) {
      this.setState({
        showCancelButton: false
      })
    }
  }

  onBlur = () => {
    const { onBlur } = this.props
    if (!this.props.keepCancelBtn) {
      this.setState({
        showCancelButton: false
      })
    }
    if (onBlur) {
      onBlur()
    }
  }

  onFocus = () => {
    this.setState({
      showCancelButton: true
    })
    if (this.props.onFocus) {
      this.props.onFocus()
    }
  }

  clearInput = () => {
    this.setState({ text: '' })
    this.onChangeText('')
  }

  onSearchButtonPress = () => {
    if (this.props.onSearchButtonPress) {
      this.props.onSearchButtonPress(this.state.text)
    }

    this.searchBlur()
  }

  onChangeText = text => {
    this.setState({ text })

    if (this.props.search) {
      if (this.props.async) {
        if (this.props.asyncInstantCallback) {
          this.props.asyncInstantCallback(text)
        }
        this.search(text)
      } else {
        this.props.search(text)
      }
    }
  }

  search = debounce(text => {
    this.props.search(text)
  }, this.AppConfig.searchDebounce)

  render() {
    const {
      placeholder,
      editable,
      autoFocus
    } = this.props

    return (
      <View style={[
        this.styles.container,
        !this.props.noBorder && {
          borderBottomColor: this.AppConfig.borderColor,
          borderBottomWidth: 1,
        }
      ]}>
        {editable === false ? (
          <View style={[this.styles.inputView, { backgroundColor: this.AppConfig.dark ? '#222222' : '#F4F4F4' }]}>
            <Text style={[this.styles.inputText, { color: this.AppConfig.dark ? '#777777' : '#BBBBBB' }]}>
              {placeholder || this.Locale.getItem('Поиск')}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1, flexDirection: 'row', position: 'relative' }}>
            <TextInput
              ref={this.textInput}
              style={[
                this.styles.inputView,
                this.styles.inputText,
                {
                  color: this.AppConfig.titleColor,
                  backgroundColor: this.AppConfig.dark ? '#222222' : '#F4F4F4',
                  paddingRight: 30
                },
              ]}
              autoFocus={autoFocus}
              onSubmitEditing={this.onSearchButtonPress}
              onChangeText={this.onChangeText}
              onFocus={this.onFocus}
              onBlur={this.onBlur}
              placeholder={placeholder || this.Locale.getItem('Поиск')}
              placeholderTextColor={this.AppConfig.dark ? '#777777' : '#BBBBBB'}
              value={this.state.text}
              underlineColorAndroid='transparent'
              returnKeyType='done'
            />
            {this.state.text ? (
              <TouchableOpacity
                style={{ alignItems: 'center', flexDirection: 'row', marginLeft: 10, position: 'absolute', right: 8, top: this.AppConfig.android ? 10 : 8 }}
                onPress={() => {
                  this.onChangeText('')
                  this.searchFocus()
                }}
              >
                <Icon name='x' size={18} color={this.AppConfig.dark ? '#777777' : '#BBBBBB'} />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        {this.state.showCancelButton ? (
          <TouchableOpacity
            style={{ alignItems: 'center', flexDirection: 'row', marginLeft: 10 }}
            onPress={this.onCancelButtonPress}
          >
            <Text style={{ fontSize: 16, fontFamily: 'TTNorms-Medium', color: this.AppConfig.mainColor }}>
              {this.Locale.getItem('Отмена')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    )
  }
}

export default React.forwardRef((props, ref) => <AppSearchBar forwardedRef={ref} {...props} />) as any
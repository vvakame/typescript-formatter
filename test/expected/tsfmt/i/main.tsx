<View style={styles.container}>
    <Text>
        I am a lightbox!
    </Text>
    <TouchableOpacity onPress={this.dismissLightBox.bind(this)}>
        <Text>Close Me!</Text>
    </TouchableOpacity>
</View>
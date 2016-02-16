package com.droidyue.readmodedemo;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.text.TextUtils;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;

public class MainActivity extends AppCompatActivity {
    private static final String LOGTAG = "MainActivity";
    private WebView mWebView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        initWebView();
        loadHomePage();
    }

    private void initWebView() {
        mWebView = (WebView) findViewById(R.id.myWebView);
        mWebView.setWebChromeClient(new WebChromeClient());
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return super.shouldOverrideUrlLoading(view, url);
            }
        });
        mWebView.getSettings().setJavaScriptEnabled(true);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_home) {
            loadHomePage();
        } else if (id == R.id.action_back) {
            if (mWebView.canGoBack()) {
                mWebView.goBack();
            }
        } else if (id == R.id.go_read_mode) {
            String readabilityJsContent = getReadabilityJsContent();
            if (!TextUtils.isEmpty(readabilityJsContent)) {
                Log.i(LOGTAG, "readabilityJsContent=" + readabilityJsContent);
                HashMap<String, String> headers = new HashMap<>();
                headers.put("Referer", mWebView.getUrl());
                mWebView.loadUrl("javascript:" + readabilityJsContent, headers);
            }
        } else if (id == R.id.action_reload) {
            mWebView.reload();
        }

        return super.onOptionsItemSelected(item);
    }

    private void loadHomePage() {
        mWebView.loadUrl("http://1.toolite.sinaapp.com/test_dir/web_navi.html");
    }

    private String getReadabilityJsContent() {
        InputStream inputStream = getResources().openRawResource(R.raw.readmode);

        BufferedReader r = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder total = new StringBuilder();
        String line;
        try {
            while ((line = r.readLine()) != null) {
                total.append(line + "\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return total.toString();
    }
}

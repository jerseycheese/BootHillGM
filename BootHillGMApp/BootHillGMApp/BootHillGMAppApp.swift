//
//  BootHillGMAppApp.swift
//  BootHillGMApp
//
//  Created by Jack Haas on 8/30/24.
//

import SwiftUI

@main
struct BootHillGMAppApp: App {
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(GameCore(aiService: AIService()))
        }
    }
}
